import { ISupplierModel } from '../interfaces';
import { User } from './User';
import { Schema } from 'mongoose';

const supplierSchema = new Schema({
    businessLicense: {
        file: { 
            secure_url: String,
            public_id: String,
        },   
        number: String,
    },
    ratings: {
        type: Number,
        default: 0,
    },
});

export const Supplier = User.discriminator<ISupplierModel>('Supplier', supplierSchema);
