"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductfromProductCartSchema = exports.addPrdocutToProductCartSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.addPrdocutToProductCartSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(utils_1.MongoDBObjectId),
    quantity: zod_1.z.number().min(1),
    note: zod_1.z.string().optional()
});
exports.removeProductfromProductCartSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(utils_1.MongoDBObjectId)
});
