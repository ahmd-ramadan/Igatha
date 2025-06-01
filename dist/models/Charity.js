"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Charity = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const charitySchema = new mongoose_1.Schema({
    workPermit: {
        file: {
            secure_url: String,
            public_id: String,
        },
        image: {
            secure_url: String,
            public_id: String,
        },
    },
    address: {
        type: String,
        required: true,
    },
    donations: {
        type: Number,
        default: 0,
    },
});
exports.Charity = User_1.User.discriminator('Charity', charitySchema);
