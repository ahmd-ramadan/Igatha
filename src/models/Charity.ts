import { ICharityModel, IKitchenModel } from '../interfaces';
import { User } from './User';
import { Schema} from 'mongoose';

const charitySchema = new Schema({
    organizationName: {
        type: String,
        required: true,
    },
});

export const Charity = User.discriminator<ICharityModel>('Charity', charitySchema);
