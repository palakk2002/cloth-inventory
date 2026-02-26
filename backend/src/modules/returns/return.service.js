const Return = require('../../models/return.model');
const Sale = require('../../models/sale.model');
const StoreInventory = require('../../models/storeInventory.model');
const { ReturnType, StockHistoryType } = require('../../core/enums');
const { withTransaction } = require('../../services/transaction.service');
const { adjustStock, adjustStoreStock } = require('../../services/stock.service');
const { createAuditLog } = require('../../middlewares/audit.middleware');

/**
 * Generate unique Return Number (RTN-2025-00001)
 */
const generateReturnNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `RTN-${year}-`;
    
    const lastReturn = await Return.findOne(
        { returnNumber: new RegExp(`^${prefix}`) },
        { returnNumber: 1 }
    ).sort({ returnNumber: -1 });
    
    let nextNum = 1;
    if (lastReturn && lastReturn.returnNumber) {
        const parts = lastReturn.returnNumber.split('-');
        const lastNum = parseInt(parts[2]);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }
    
    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
};

/**
 * Process a Return
 */
const processReturn = async (returnData, userId) => {
    return await withTransaction(async (session) => {
        const { type, storeId, productId, quantity, referenceSaleId } = returnData;

        // 1. Logic for Customer Return
        if (type === ReturnType.CUSTOMER_RETURN) {
            if (!referenceSaleId) throw new Error('Sale reference is required for customer returns');
            
            const sale = await Sale.findById(referenceSaleId).session(session);
            if (!sale) throw new Error('Sale record not found');

            // Validate quantity returned vs quantity sold
            const soldItem = sale.products.find(p => p.productId.toString() === productId.toString());
            if (!soldItem) throw new Error('Product not found in this sale');
            if (quantity > soldItem.quantity) throw new Error('Cannot return more than sold quantity');

            // Increase Store Inventory
            await adjustStoreStock({
                productId,
                storeId,
                quantityChange: quantity,
                type: StockHistoryType.RETURN,
                referenceId: null,
                referenceModel: 'Return',
                performedBy: userId,
                notes: `Customer return from Sale ${sale.saleNumber}`,
                session
            });

            // Update quantitySold and quantityReturned in Store Inventory
            await StoreInventory.findOneAndUpdate(
                { storeId, productId },
                { 
                    $inc: { 
                        quantitySold: -quantity,
                        quantityReturned: quantity,
                        quantityAvailable: quantity // already handled by adjustStoreStock, but just to be sure we are consistent
                    } 
                },
                { session }
            );
        }

        // 2. Logic for Store to Factory Transfer
        if (type === ReturnType.STORE_TO_FACTORY) {
            // Reduce Store stock
            await adjustStoreStock({
                productId,
                storeId,
                quantityChange: -quantity,
                type: StockHistoryType.OUT,
                referenceId: null,
                referenceModel: 'Return',
                performedBy: userId,
                notes: 'Return to factory',
                session
            });

            // Increase Factory stock
            await adjustStock({
                productId,
                quantityChange: quantity,
                type: StockHistoryType.IN,
                referenceId: null,
                referenceModel: 'Return',
                performedBy: userId,
                notes: `Return from Store ID ${storeId}`,
                session
            });
        }

        // 3. Logic for Damaged Stock marking
        if (type === ReturnType.DAMAGED) {
            // Reduce Store stock (available)
            await adjustStoreStock({
                productId,
                storeId,
                quantityChange: -quantity,
                type: StockHistoryType.OUT,
                referenceId: null,
                referenceModel: 'Return',
                performedBy: userId,
                notes: 'Damaged stock marking',
                session
            });
            
            // We record it as a return record with type DAMAGED.
        }

        const returnNumber = await generateReturnNumber();
        const returnRecord = new Return({
            ...returnData,
            returnNumber,
            createdBy: userId
        });
        await returnRecord.save({ session });

        // Audit Log
        await createAuditLog({
            performedBy: userId,
            action: `PROCESS_${type}`,
            module: 'RETURNS',
            targetId: returnRecord._id,
            targetModel: 'Return',
            after: returnRecord.toObject()
        });

        return returnRecord;
    });
};

/**
 * Get Return History
 */
const getAllReturns = async (query) => {
    const { page = 1, limit = 10, type, storeId, productId, startDate, endDate } = query;
    const filter = { isDeleted: false };
    
    if (type) filter.type = type;
    if (storeId) filter.storeId = storeId;
    if (productId) filter.productId = productId;
    
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    const skip = (page - 1) * limit;
    const [returns, total] = await Promise.all([
        Return.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('storeId', 'name')
            .populate('productId', 'name sku barcode')
            .populate('createdBy', 'name')
            .populate('referenceSaleId', 'saleNumber'),
        Return.countDocuments(filter)
    ]);

    return { returns, total, page: parseInt(page), limit: parseInt(limit) };
};

const getReturnById = async (id) => {
    const record = await Return.findById(id)
        .populate('storeId')
        .populate('productId')
        .populate('createdBy', 'name')
        .populate('referenceSaleId');
    if (!record) throw new Error('Return record not found');
    return record;
};

module.exports = {
    processReturn,
    getAllReturns,
    getReturnById
};
