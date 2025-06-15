import { model, Schema } from 'mongoose'
import { ISurplusModel } from '../interfaces';

const surplusSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
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
    isActive: {
        type: Boolean,
        required: true
    },
    adminNotes: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
})

surplusSchema.virtual('userData', {
    localField: 'userId',
    foreignField: '_id',
    ref: 'User',
    justOne: true,
    options: {
        select: "name avatar rating"
    }
})


export const Surplus = model<ISurplusModel>('Surplus', surplusSchema);