const Product = require('../../models/product.model');
const StockHistory = require('../../models/stockHistory.model');
const { StockHistoryType } = require('../../core/enums');
const { withTransaction } = require('../../services/transaction.service');

/**
 * Generate unique SKU (SKU-2025-00001)
 */
const generateSKU = async () => {
    const year = new Date().getFullYear();
    const prefix = `SKU-${year}-`;
    
    const lastProduct = await Product.findOne(
        { sku: new RegExp(`^${prefix}`) },
        { sku: 1 }
    ).sort({ sku: -1 });
    
    let nextNum = 1;
    if (lastProduct && lastProduct.sku) {
        const lastNum = parseInt(lastProduct.sku.split('-')[2]);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }
    
    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
};

/**
 * Generate unique numeric barcode
 */
const generateBarcode = async () => {
    let unique = false;
    let barcode;
    
    while (!unique) {
        // Generate 12-digit numeric barcode
        barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const existing = await Product.findOne({ barcode });
        if (!existing) unique = true;
    }
    
    return barcode;
};

/**
 * Create products from a production batch (Transaction)
 */
const createProductsFromBatch = async (batch, metadata, session) => {
    const { name, category, brand, costPrice, salePrice } = metadata;

    const creations = batch.sizeBreakdown.map(async (item) => {
        const sku = await generateSKU();
        const barcode = await generateBarcode();
        
        const product = new Product({
            name,
            sku,
            barcode,
            batchId: batch._id,
            size: item.size,
            color: metadata.color || null,
            category,
            brand,
            costPrice,
            salePrice,
            factoryStock: item.quantity,
            createdBy: batch.createdBy,
            isActive: true
        });

        await product.save({ session });

        // Record stock history
        await StockHistory.create([{
            productId: product._id,
            type: StockHistoryType.IN,
            quantityBefore: 0,
            quantityChange: item.quantity,
            quantityAfter: item.quantity,
            referenceId: batch._id,
            referenceModel: 'ProductionBatch',
            notes: `Initial stock from Production Batch ${batch.batchNumber}`,
            performedBy: batch.createdBy
        }], { session });

        return product;
    });

    return await Promise.all(creations);
};

/**
 * Get all products
 */
const getAllProducts = async (query) => {
    const { page = 1, limit = 10, search, category, size, isActive } = query;
    
    const filter = { isDeleted: false };
    
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { barcode: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (category) filter.category = category;
    if (size) filter.size = size;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('batchId', 'batchNumber'),
        Product.countDocuments(filter)
    ]);

    return { products, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get product by barcode
 */
const getProductByBarcode = async (barcode) => {
    const product = await Product.findOne({ barcode, isDeleted: false }).populate('batchId', 'batchNumber');
    if (!product) throw new Error('Product not found with this barcode');
    return product;
};

/**
 * Get product by ID
 */
const getProductById = async (id) => {
    const product = await Product.findOne({ _id: id, isDeleted: false }).populate('batchId', 'batchNumber');
    if (!product) throw new Error('Product not found');
    return product;
};

/**
 * Update product
 */
const updateProduct = async (id, updateData) => {
    const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateData },
        { new: true, runValidators: true }
    );
    if (!product) throw new Error('Product not found');
    return product;
};

/**
 * Toggle product status
 */
const toggleStatus = async (id, isActive) => {
    const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isActive } },
        { new: true }
    );
    if (!product) throw new Error('Product not found');
    return product;
};

/**
 * Delete product (soft)
 */
const deleteProduct = async (id) => {
    const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, isActive: false } },
        { new: true }
    );
    if (!product) throw new Error('Product not found');
    return product;
};

module.exports = {
    generateSKU,
    generateBarcode,
    createProductsFromBatch,
    getAllProducts,
    getProductByBarcode,
    getProductById,
    updateProduct,
    toggleStatus,
    deleteProduct
};
