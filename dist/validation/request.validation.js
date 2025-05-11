"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestSchema = exports.rejectOnRequestSchema = exports.getAllRequestsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
exports.getAllRequestsSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(utils_1.MongoDBObjectId).optional(),
    role: zod_1.z.nativeEnum(enums_1.UserRolesEnum).optional(),
    status: zod_1.z.nativeEnum(enums_1.RequestStatusEnum).optional(),
    type: zod_1.z.nativeEnum(enums_1.RequestTypeEnum).optional(),
});
exports.rejectOnRequestSchema = zod_1.z.object({
    rejectionReason: zod_1.z.string().min(1, "يجب أن يكون السبب على الأقل 1 حرف")
});
//! all extends from all updates profiles schemas
//! to avoid inputs errors
exports.updateRequestSchema = zod_1.z.any();
