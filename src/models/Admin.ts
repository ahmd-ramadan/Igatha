import { IAdminModel } from '../interfaces';
import { User } from './User';
import { Schema } from 'mongoose';

const adminSchema = new Schema({});

export const Admin = User.discriminator<IAdminModel>('admin', adminSchema);
