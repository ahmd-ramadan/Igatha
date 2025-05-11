"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviewsQuerySchema = exports.updateReviewSchema = exports.addReviewSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.addReviewSchema = zod_1.z.object({
    doctorId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'مَعرف الدكتور غير صحيح'),
    rating: zod_1.z.number().int().positive().min(1).max(5),
    comment: zod_1.z.string().optional()
});
exports.updateReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().positive().min(1).max(5).optional(),
    comment: zod_1.z.string().optional()
});
exports.getAllReviewsQuerySchema = zod_1.z.object({
    doctorId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'مَعرف الدكتور غير صحيح').optional(),
    userId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
});
