import { Schema, model } from 'mongoose'
import { IAddressModel } from '../interfaces/address.interface';

const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    first_name: {
        type: String,
        required: true
    }, 
    last_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
})

addressSchema.virtual('userData', {
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
    ref: 'User',
})

export const Address = model<IAddressModel>('Address', addressSchema);