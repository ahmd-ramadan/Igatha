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
exports.ProductOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const enums_1 = require("../enums");
const productOrderSchema = new mongoose_1.Schema({
    orderCode: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    kitchenId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Kitchen',
        required: true,
        index: true
    },
    shippingAddressId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    orderItems: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            supplierId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Supplier',
                required: true,
                index: true
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
    subtotalPrice: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        required: true
    },
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
    timeline: [
        {
            status: {
                type: String,
                enum: Object.values(enums_1.OrderStatus),
                required: true
            },
            occuredAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    isPaid: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
productOrderSchema.virtual('kitchenData', {
    localField: 'kitchenId',
    foreignField: '_id',
    ref: 'Kitchen',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
});
// productOrderSchema.virtual('totalPrice').get(function() {
//     let totalPrice = this.subtotalPrice + this.shippingPrice;
//     // if (this?.coupon?.code) {
//     //     const discountAmount = this?.coupon?.discountType === CouponDiscountTypes.FREE_SHIPPING ? 
//     //         this.shippingPrice : 
//     //         this?.coupon?.discountAmount || 0;
//     //     totalPrice = totalPrice - discountAmount;
//     // }
//     return totalPrice;
// })
productOrderSchema.virtual('shippingAddressData', {
    localField: 'shippingAddressId',
    foreignField: '_id',
    ref: 'Address',
    justOne: true
});
productOrderSchema.virtual('suppliersData', {
    localField: 'orderItems.supplierId',
    foreignField: '_id',
    ref: 'Supplier',
    justOne: false,
    options: {
        select: 'name avatar rating'
    }
});
exports.ProductOrder = mongoose_1.default.model('ProductOrder', productOrderSchema);
