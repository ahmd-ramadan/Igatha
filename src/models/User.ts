import { Schema, model } from 'mongoose';
import { UserRolesEnum, UserStatusEnum } from '../enums';
import { IUserModel } from '../interfaces';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: Object.values(UserRolesEnum),
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: UserStatusEnum,
        default: 'pending',
    },
    avatar: {
        secure_url: String,
        public_id: String
    },
    rejectionReason: {
        type: String,
    },
}, { 
    discriminatorKey: 'role', 
    timestamps: true
});

export const User = model<IUserModel>('User', userSchema);