"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
addressSchema.virtual('userData', {
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
    ref: 'User',
});
exports.Address = (0, mongoose_1.model)('Address', addressSchema);
