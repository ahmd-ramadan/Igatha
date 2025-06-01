"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../enums");
const userSchema = new mongoose_1.Schema({
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
        enum: Object.values(enums_1.UserRolesEnum),
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: enums_1.UserStatusEnum,
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
exports.User = (0, mongoose_1.model)('User', userSchema);
