import { model, Schema } from 'mongoose'
import { ISurplusOrderModel, SurplusOrderStatus } from '../interfaces';

const surplusOrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    charityId: {
        type: Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
        index: true
    },
    orderCode: {
        type: String,
        required: true
    },
    shippingAddressId: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true 
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
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
            }
        }
    ],
    note: {
        type: String
    },
    status: {
        type: String,
        enum: Object.values(SurplusOrderStatus),
        index: true,
        required: true
    }, 
    timeline: [
        {
            status: {
                type: String,
                enum: Object.values(SurplusOrderStatus),
                required: true
            },
            occuredAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
})

surplusOrderSchema.virtual('userData', {
    localField: 'userId',
    foreignField: '_id',
    ref: 'User',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
})

surplusOrderSchema.virtual('charityData', {
    localField: 'charityId',
    foreignField: '_id',
    ref: 'Charity',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
})

surplusOrderSchema.virtual('shippingAddressData', {
    localField: 'shippingAddressId',
    foreignField: '_id',
    ref: 'Address',
    justOne: true
})


export const SurplusOrder = model<ISurplusOrderModel>('SurplusOrder', surplusOrderSchema);