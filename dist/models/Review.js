"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        idex: true
    },
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    comment: {
        type: String
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
reviewSchema.virtual('doctorData', {
    localField: 'doctorId',
    foreignField: '_id',
    ref: 'User',
    justOne: true
});
reviewSchema.virtual('userData', {
    localField: 'userId',
    foreignField: '_id',
    ref: 'User',
    justOne: true
});
exports.Review = (0, mongoose_1.model)("Review", reviewSchema);
