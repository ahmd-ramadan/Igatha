"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
const token_enums_1 = require("../enums/token.enums");
const tokenSchema = new mongoose_1.Schema({
    token: {
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
    type: {
        type: String,
        enum: Object.values(token_enums_1.TokenTypesEnum),
        default: token_enums_1.TokenTypesEnum.REFRESH
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
tokenSchema.virtual('userData', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
    options: {
        select: 'name role _id'
    }
});
exports.Token = (0, mongoose_1.model)('Token', tokenSchema);
