const Fabric = require('../../models/fabric.model');
const Supplier = require('../../models/supplier.model');

/**
 * Create a new fabric purchase
 */
const createFabric = async (fabricData, userId) => {
    // Check if supplier exists and is active
    const supplier = await Supplier.findOne({ _id: fabricData.supplierId, isDeleted: false });
    if (!supplier) {
        throw new Error('Supplier not found');
    }
    if (!supplier.isActive) {
        throw new Error('Selected supplier is inactive. Cannot purchase fabric.');
    }

    const fabric = new Fabric({
        ...fabricData,
        createdBy: userId
    });

    return await fabric.save();
};

/**
 * Get all fabrics with filters, search and pagination
 */
const getAllFabrics = async (query) => {
    const {
        page = 1,
        limit = 10,
        search,
        supplierId,
        fabricType,
        startDate,
        endDate,
        status,
        isActive
    } = query;

    const filter = { isDeleted: false };

    if (search) {
        filter.invoiceNumber = { $regex: search, $options: 'i' };
    }

    if (supplierId) filter.supplierId = supplierId;
    if (fabricType) filter.fabricType = { $regex: fabricType, $options: 'i' };
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Date range filter
    if (startDate || endDate) {
        filter.purchaseDate = {};
        if (startDate) filter.purchaseDate.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.purchaseDate.$lte = end;
        }
    }

    const skip = (page - 1) * limit;

    const [fabrics, total] = await Promise.all([
        Fabric.find(filter)
            .sort({ purchaseDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('supplierId', 'name contactPerson phone')
            .populate('createdBy', 'name email'),
        Fabric.countDocuments(filter)
    ]);

    return { fabrics, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get single fabric by ID
 */
const getFabricById = async (id) => {
    const fabric = await Fabric.findOne({ _id: id, isDeleted: false })
        .populate('supplierId', 'name contactPerson phone')
        .populate('createdBy', 'name email');

    if (!fabric) {
        throw new Error('Fabric purchase record not found');
    }
    return fabric;
};

/**
 * Update fabric details
 */
const updateFabric = async (id, updateData) => {
    const fabric = await Fabric.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!fabric) {
        throw new Error('Fabric record not found');
    }

    return fabric;
};

/**
 * Toggle fabric status (ACTIVE/CONSUMED) or isActive
 */
const updateFabricStatus = async (id, statusData) => {
    const fabric = await Fabric.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: statusData },
        { new: true }
    );

    if (!fabric) {
        throw new Error('Fabric record not found');
    }

    return fabric;
};

/**
 * Soft delete fabric
 */
const deleteFabric = async (id) => {
    const fabric = await Fabric.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, isActive: false } },
        { new: true }
    );

    if (!fabric) {
        throw new Error('Fabric record not found or already deleted');
    }

    return fabric;
};

module.exports = {
    createFabric,
    getAllFabrics,
    getFabricById,
    updateFabric,
    updateFabricStatus,
    deleteFabric
};
