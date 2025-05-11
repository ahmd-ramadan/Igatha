"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Charity = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const charitySchema = new mongoose_1.Schema({
    organizationName: {
        type: String,
        required: true,
    },
});
exports.Charity = User_1.User.discriminator('Charity', charitySchema);
