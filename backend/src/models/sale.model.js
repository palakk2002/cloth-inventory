const mongoose = require('mongoose');
const { PaymentMethod, SaleStatus } = require('../core/enums');

const saleItemSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    barcode: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    price: { 
        type: Number, 
        required: true 
    },
    total: { 
        type: Number, 
        required: true 
    }
}, { _id: false });

const saleSchema = new mongoose.Schema(
    {
        saleNumber: { 
            type: String, 
            unique: true, 
            trim: true 
        },
        storeId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Store', 
            required: true 
        },
        cashierId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        products: [saleItemSchema],
        subTotal: { 
            type: Number, 
            required: true 
        },
        discount: { 
            type: Number, 
            default: 0 
        },
        tax: { 
            type: Number, 
            default: 0 
        },
        grandTotal: { 
            type: Number, 
            required: true 
        },
        paymentMode: { 
            type: String, 
            enum: Object.values(PaymentMethod), 
            default: PaymentMethod.CASH 
        },
        status: {
            type: String,
            enum: Object.values(SaleStatus),
            default: SaleStatus.COMPLETED
        },
        saleDate: { 
            type: Date, 
            default: Date.now 
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Indexes
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ storeId: 1 });
saleSchema.index({ saleDate: -1 });

module.exports = mongoose.model('Sale', saleSchema);
