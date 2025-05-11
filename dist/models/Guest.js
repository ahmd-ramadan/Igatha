"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guest = void 0;
const User_1 = require("./User");
const mongoose_1 = require("mongoose");
const guestSchema = new mongoose_1.Schema({});
exports.Guest = User_1.User.discriminator('Guest', guestSchema);
