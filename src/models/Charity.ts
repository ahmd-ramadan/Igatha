import { ICharityModel, IKitchenModel } from '../interfaces';
import { User } from './User';
import { Schema} from 'mongoose';

const charitySchema = new Schema({
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
    donations: {
        type: Number,
        default: 0,
    },
});

export const Charity = User.discriminator<ICharityModel>('Charity', charitySchema);
