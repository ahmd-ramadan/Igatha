"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supplier = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const supplierSchema = new mongoose_1.Schema({
    commercialRegister: {
        file: {
            secure_url: String,
            public_id: String,
        },
        image: {
            secure_url: String,
            public_id: String,
        },
    },
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
    rating: {
        type: Number,
        default: 0,
    },
    sales: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        default: 0,
    },
    totalBalance: {
        type: Number,
        default: 0,
    },
    currentBalance: {
        type: Number,
        default: 0,
    },
});
exports.Supplier = User_1.User.discriminator('Supplier', supplierSchema);
