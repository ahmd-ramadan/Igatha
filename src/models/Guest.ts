import { IKitchenModel } from '../interfaces';
import { IGuestModel } from '../interfaces/guest.interface';
import { User } from './User';
import { Schema } from 'mongoose';

const guestSchema = new Schema({
});

export const Guest = User.discriminator<IGuestModel>('Guest', guestSchema);
