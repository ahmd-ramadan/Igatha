"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const mongoose_1 = require("mongoose");
const otpSchema = new mongoose_1.Schema({
    otp: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
}, {
    timestamps: true,
    versionKey: false
});
exports.Otp = (0, mongoose_1.model)('Otp', otpSchema);
