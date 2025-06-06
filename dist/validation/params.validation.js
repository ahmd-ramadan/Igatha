"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugParamsSchema = exports.paramsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.paramsSchema = zod_1.z.object({
    _id: zod_1.z.string().regex(utils_1.MongoDBObjectId, "معرف غير صحيح"),
});
exports.slugParamsSchema = zod_1.z.object({
    slug: zod_1.z.string()
});
