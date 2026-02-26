const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, 'Product name is required'], 
            trim: true 
        },
        sku: { 
            type: String, 
            required: true, 
            unique: true, 
            uppercase: true, 
            trim: true 
        },
        barcode: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true 
        },
        batchId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'ProductionBatch',
            required: true
        },
        size: { 
            type: String, 
            required: true,
            enum: ['S', 'M', 'L', 'XL', 'XXL', 'FREE'],
            trim: true 
        },
        color: { 
            type: String, 
            trim: true 
        },
        category: { 
            type: String, 
            trim: true 
        },
        brand: { 
            type: String, 
            trim: true 
        },
        costPrice: { 
            type: Number, 
            default: 0,
            min: 0 
        },
        salePrice: { 
            type: Number, 
            required: [true, 'Sale price is required'],
            min: 0 
        },
        factoryStock: { 
            type: Number, 
            default: 0, 
            min: 0 
        },
        minStockLevel: { 
            type: Number, 
            default: 5 
        },
        isActive: { 
            type: Boolean, 
            default: true 
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        },
        images: [{ type: String }],
    },
    { timestamps: true }
);

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ batchId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isDeleted: 1 });
productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
