import { Schema, model } from 'mongoose';
import { UserRolesEnum, UserStatusEnum } from '../enums';
import { IUserModel } from '../interfaces';
import { HashingService } from '../services';

const UserSchema = new Schema({
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
        default: false,
    },
    status: {
        type: String,
        enum: UserStatusEnum,
        default: 'pending',
    },
    avatar: {
        secure_url: String,
        path_id: String
    },
    rejectionReason: {
        type: String,
    },
}, { 
    discriminatorKey: 'role', 
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await HashingService.hash(this.password);
    }
    next();
});

export const User = model<IUserModel>('User', UserSchema);