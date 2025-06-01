import mongoose, { Schema } from 'mongoose'
import { OrderStatus } from '../enums'
import { IProductSubOrderModel } from '../interfaces'

const productSubOrderSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'ProductOrder',
        required: true,
        index: true
    },
    supplierId: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        index: true
    },
    orderItems: [
        {
            productId: {
                type: Schema.Types.ObjectId,
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
        enum: Object.values(OrderStatus),
        required: true
    },

}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
})

productSubOrderSchema.virtual('supplierData', {
    localField: 'kitchenId',
    foreignField: '_id',
    ref: 'Supplier',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
})

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
})

export const ProductSubOrder = mongoose.model<IProductSubOrderModel>('ProductSubOrder', productSubOrderSchema); 