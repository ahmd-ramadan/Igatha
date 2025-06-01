"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCart = void 0;
const mongoose_1 = require("mongoose");
const productCartSchema = new mongoose_1.Schema({
    kitchenId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Kitchen",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            note: {
                type: String,
                required: false
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
productCartSchema.virtual('kitchenData', {
    ref: 'Kitchen',
    localField: 'kitchenId',
    foreignField: '_id',
    justOne: true,
    options: {
        select: 'name avatar role rating'
    }
});
productCartSchema.virtual('productsData', {
    ref: 'Product',
    localField: 'products.productId',
    foreignField: '_id',
    justOne: false,
    options: {
        select: 'appliedPrice images title slug'
    }
});
exports.ProductCart = (0, mongoose_1.model)("ProductCart", productCartSchema);
