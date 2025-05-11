"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kitchen = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const kitchenSchema = new mongoose_1.Schema({
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
    },
    rating: {
        type: Number,
        default: 0,
    },
});
exports.Kitchen = User_1.User.discriminator('Kitchen', kitchenSchema);
