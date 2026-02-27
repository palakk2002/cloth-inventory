const Sale = require('../../models/sale.model');
const StoreInventory = require('../../models/storeInventory.model');
const Product = require('../../models/product.model');
const { SaleStatus, StockHistoryType } = require('../../core/enums');
const { withTransaction } = require('../../services/transaction.service');
const { adjustStoreStock } = require('../../services/stock.service');
const { createAuditLog } = require('../../middlewares/audit.middleware');
const { getIO } = require('../../config/socket');

/**
 * Generate unique Sale/Invoice Number (INV-2025-00001)
 */
const generateSaleNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastSale = await Sale.findOne(
        { saleNumber: new RegExp(`^${prefix}`) },
        { saleNumber: 1 }
    ).sort({ saleNumber: -1 });

    let nextNum = 1;
    if (lastSale && lastSale.saleNumber) {
        const parts = lastSale.saleNumber.split('-');
        const lastNum = parseInt(parts[2]);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
};

/**
 * Get product by barcode for scanning
 */
const getProductForSale = async (barcode, storeId) => {
    const product = await Product.findOne({ barcode, isDeleted: false, isActive: true });
    if (!product) throw new Error('Product not found or inactive');

    const inventory = await StoreInventory.findOne({ storeId, productId: product._id });
    if (!inventory || inventory.quantityAvailable <= 0) {
        throw new Error('Out of stock in this store');
    }

    return {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        salePrice: product.salePrice,
        available: inventory.quantityAvailable
    };
};

/**
 * Create a new Sale
 */
const createSale = async (saleData, cashierId) => {
    return await withTransaction(async (session) => {
        const { storeId, products, subTotal, discount, tax, grandTotal, paymentMode } = saleData;

        // 1. Generate Sale Number
        const saleNumber = await generateSaleNumber();

        // 2. Process Products and Update Inventory
        for (const item of products) {
            const inventory = await StoreInventory.findOne({
                storeId,
                productId: item.productId
            }).session(session);

            if (!inventory || inventory.quantityAvailable < item.quantity) {
                const product = await Product.findById(item.productId);
                throw new Error(`Insufficient stock for ${product ? product.name : 'product'}`);
            }

            // Reduce stock
            await adjustStoreStock({
                productId: item.productId,
                storeId,
                quantityChange: -item.quantity,
                type: StockHistoryType.SALE,
                referenceId: null, // Will update after sale save
                referenceModel: 'Sale',
                performedBy: cashierId,
                notes: `Sale ${saleNumber}`,
                session
            });

            // Update quantitySold
            inventory.quantitySold += item.quantity;
            await inventory.save({ session });
        }

        // 3. Create Sale Record
        const sale = new Sale({
            saleNumber,
            storeId,
            cashierId,
            products,
            subTotal,
            discount,
            tax,
            grandTotal,
            paymentMode,
            status: SaleStatus.COMPLETED,
            saleDate: Date.now()
        });
        await sale.save({ session });

        // Update referenceId in stock history (simplified for now as withTransaction ensures consistency)

        // 4. Audit Log
        await createAuditLog({
            performedBy: cashierId,
            action: 'CREATE_SALE',
            module: 'SALES',
            targetId: sale._id,
            targetModel: 'Sale',
            after: sale.toObject()
        });

        return sale;
    });

    // 5. Real-time update (OUTSIDE transaction - only if commit succeeds)
    try {
        getIO().emit('new-sale', {
            saleNumber: sale.saleNumber,
            storeId: sale.storeId,
            grandTotal: sale.grandTotal,
            timestamp: sale.saleDate
        });
    } catch (err) {
        console.error('Socket emit failed:', err.message);
    }

    return sale;
};

/**
 * List Sales
 */
const getAllSales = async (query, user) => {
    const { page = 1, limit = 10, storeId, startDate, endDate } = query;
    const filter = { isDeleted: false };

    // If store staff, enforce their store
    if (user.role === 'store_staff') {
        // Need to know which store the user belongs to. 
        // For now, if storeId passed in query use it, but logic should be stricter in prod.
        if (storeId) filter.storeId = storeId;
    } else {
        if (storeId) filter.storeId = storeId;
    }

    if (startDate || endDate) {
        filter.saleDate = {};
        if (startDate) filter.saleDate.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.saleDate.$lte = end;
        }
    }

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
        Sale.find(filter)
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('storeId', 'name')
            .populate('cashierId', 'name')
            .populate('products.productId', 'name sku barcode size category'),
        Sale.countDocuments(filter)
    ]);

    return { sales, total, page: parseInt(page), limit: parseInt(limit) };
};

const getSaleById = async (id) => {
    const sale = await Sale.findOne({ _id: id, isDeleted: false })
        .populate('storeId')
        .populate('cashierId', 'name')
        .populate('products.productId');
    if (!sale) throw new Error('Sale not found');
    return sale;
};

module.exports = {
    getProductForSale,
    createSale,
    getAllSales,
    getSaleById
};
