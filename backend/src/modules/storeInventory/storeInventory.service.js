const StoreInventory = require('../../models/storeInventory.model');
const Product = require('../../models/product.model');

/**
 * Get store inventory with pagination and filters
 */
const getStoreInventory = async (query, user) => {
    const { page = 1, limit = 10, search, storeId, lowStock } = query;
    
    // Authorization: Store staff can only see their own store
    const filter = {};
    if (user.role === 'store_staff') {
        // Assuming user object has a storeId if they are store staff
        // If not, we might need to fetch it from user profile if stored there
        // For now, if storeId is provided in query, use it, but ADMIN can search any.
        if (storeId) filter.storeId = storeId;
    } else {
        if (storeId) filter.storeId = storeId;
    }

    if (lowStock === 'true') {
        filter.$expr = { $lte: ['$quantityAvailable', '$minStockLevel'] };
    }

    const skip = (page - 1) * limit;
    
    const [inventory, total] = await Promise.all([
        StoreInventory.find(filter)
            .sort({ lastUpdated: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('storeId', 'name location')
            .populate('productId', 'name sku barcode size color category salePrice'),
        StoreInventory.countDocuments(filter)
    ]);

    // Apply search filter on populated product fields if search exists
    let results = inventory;
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        results = inventory.filter(item => 
            searchRegex.test(item.productId.name) || 
            searchRegex.test(item.productId.sku) || 
            searchRegex.test(item.productId.barcode)
        );
    }

    return { 
        inventory: results, 
        total: search ? results.length : total, 
        page: parseInt(page), 
        limit: parseInt(limit) 
    };
};

/**
 * Get specific product in store inventory
 */
const getProductInStore = async (storeId, productId) => {
    const item = await StoreInventory.findOne({ storeId, productId })
        .populate('storeId', 'name')
        .populate('productId');
        
    if (!item) {
        throw new Error('Product not found in store inventory');
    }
    return item;
};

module.exports = {
    getStoreInventory,
    getProductInStore
};
