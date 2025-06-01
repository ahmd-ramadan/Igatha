"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    supplierId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    desc: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: false
    },
    appliedPrice: {
        type: Number,
        required: true
    },
    images: [
        {
            secure_url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            },
        }
    ],
    stock: {
        type: Number,
        required: true
    },
    adminNotes: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        reqired: true
    },
    minimumOrderQuantity: {
        type: Number,
        required: true
    },
    saleCounter: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
productSchema.pre('save', function (next) {
    this.appliedPrice = this.price - (this.price * (this.discount || 0) / 100);
    next();
});
productSchema.virtual('supplierData', {
    ref: 'Supplier',
    localField: 'supplierId',
    foreignField: '_id',
    justOne: true,
    options: {
        select: 'name avatar role rating'
    }
});
exports.Product = (0, mongoose_1.model)("Product", productSchema);
