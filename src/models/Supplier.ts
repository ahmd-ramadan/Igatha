import { ISupplierModel } from '../interfaces';
import { User } from './User';
import { Schema } from 'mongoose';

const supplierSchema = new Schema({
    commercialRegister: {
        file: { 
            secure_url: String,
            public_id: String,
        },   
        image: {
            secure_url: String,
            public_id: String,
        },
    },
    workPermit: {
        file: { 
            secure_url: String,
            public_id: String,
        },   
        image: {
            secure_url: String,
            public_id: String,
        },
    },
    address: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    sales: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        default: 0,
    },
    totalBalance: {
        type: Number,
        default: 0,
    },
    currentBalance: {
        type: Number,
        default: 0,
    },
});

export const Supplier = User.discriminator<ISupplierModel>('Supplier', supplierSchema);
