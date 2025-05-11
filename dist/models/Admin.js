"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({});
exports.Admin = User_1.User.discriminator('admin', adminSchema);
