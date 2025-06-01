"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSubOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const enums_1 = require("../enums");
const productSubOrderSchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ProductOrder',
        required: true,
        index: true
    },
    supplierId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        index: true
    },
    orderItems: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            title: {
                type: String,
                required: true
            },
            slug: {
                type: String,
                required: true
            },
            image: {
                secure_url: String,
                public_id: String,
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
        required: true
    },
    // coupon: {
    //     code: {
    //         type: String,
    //     },
    //     discountType: {
    //         type: String,
    //         enum: Object.values(CouponDiscountTypes)
    //     },
    //     discountAmount: {
    //         type: Number
    //     }
    // },
    status: {
        type: String,
        enum: Object.values(enums_1.OrderStatus),
        required: true
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
productSubOrderSchema.virtual('supplierData', {
    localField: 'kitchenId',
    foreignField: '_id',
    ref: 'Supplier',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
});
productSubOrderSchema.virtual('orderData', {
    localField: 'orderId',
    foreignField: '_id',
    ref: 'ProductOrder',
    justOne: true,
    options: {
        populate: [
            {
                path: 'shippingAddressData',
            }, {
                path: 'kitchenData'
            }
        ]
    }
});
exports.ProductSubOrder = mongoose_1.default.model('ProductSubOrder', productSubOrderSchema);
