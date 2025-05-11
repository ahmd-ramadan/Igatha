"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supplier = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const supplierSchema = new mongoose_1.Schema({
    businessLicense: {
        file: {
            secure_url: String,
            public_id: String,
        },
        number: String,
    },
    ratings: {
        type: Number,
        default: 0,
    },
});
exports.Supplier = User_1.User.discriminator('Supplier', supplierSchema);
