import { IKitchenModel } from '../interfaces';
import { User } from './User';
import { Schema } from 'mongoose';

const kitchenSchema = new Schema({
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
    },
    rating: {
        type: Number,
        default: 0,
    },
});

export const Kitchen = User.discriminator<IKitchenModel>('Kitchen', kitchenSchema);
