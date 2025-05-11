"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const campaignSchema = new mongoose_1.Schema({
    pilgrimsCount: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    commercialRegister: {
        file: {
            secure_url: String,
            public_id: String
        },
        image: {
            secure_url: String,
            public_id: String
        },
    },
    hajjReference: {
        file: {
            secure_url: String,
            public_id: String
        },
        image: {
            secure_url: String,
            public_id: String
        },
    },
});
campaignSchema.pre('validate', function (next) {
    // Check hajjReference
    if (!this.hajjReference || !this.hajjReference.file || !this.hajjReference.image) {
        return next(new Error('أدخل أحد الملفات أو الصورة المطلوبة لتصريح الحج'));
    }
    next();
});
exports.Campaign = User_1.User.discriminator('Campaign', campaignSchema);
