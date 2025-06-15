import mongoose, { model, Schema } from 'mongoose'
import { OrderStatus } from '../enums'
import { IMealOrderModel, IProductOrderModel } from '../interfaces'

const mealOrderSchema = new Schema({
    orderCode: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    kitchenId: {
        type: Schema.Types.ObjectId,
        ref: 'Kitchen',
        required: true,
        index: true
    },
    campaignId: {
        type: Schema.Types.ObjectId,
        ref: 'Campain',
        required: true,
        index: true
    },
    shippingAddressId: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    orderItems: [
        {
            mealId: {
                type: Schema.Types.ObjectId,
                ref: 'Meal',
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
                enum: Object.values(OrderStatus),
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
})

mealOrderSchema.virtual('kitchenData', {
    localField: 'kitchenId',
    foreignField: '_id',
    ref: 'Kitchen',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
})
mealOrderSchema.virtual('campaignData', {
    localField: 'campaignId',
    foreignField: '_id',
    ref: 'Campaign',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
})

// mealOrderSchema.virtual('totalPrice').get(function() {
//     let totalPrice = this.subtotalPrice + this.shippingPrice;
//     // if (this?.coupon?.code) {
//     //     const discountAmount = this?.coupon?.discountType === CouponDiscountTypes.FREE_SHIPPING ? 
//     //         this.shippingPrice : 
//     //         this?.coupon?.discountAmount || 0;

//     //     totalPrice = totalPrice - discountAmount;
//     // }
//     return totalPrice;
// })

mealOrderSchema.virtual('shippingAddressData', {
    localField: 'shippingAddressId',
    foreignField: '_id',
    ref: 'Address',
    justOne: true
})


export const MealOrder = model<IMealOrderModel>('MealOrder', mealOrderSchema);