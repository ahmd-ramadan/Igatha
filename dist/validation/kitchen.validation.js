"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKitchenSchema = exports.createKitchenSchema = void 0;
const zod_1 = require("zod");
const auth_validation_1 = require("./auth.validation");
const file_validation_1 = require("./file.validation");
const user_validation_1 = require("./user.validation");
exports.createKitchenSchema = auth_validation_1.registerSchema.extend({
    commercialRegisterImage: file_validation_1.imageSchema.optional(),
    workPermitImage: file_validation_1.imageSchema.optional(),
    commercialRegisterFile: file_validation_1.fileSchema.optional(),
    workPermitFile: file_validation_1.fileSchema.optional(),
    address: zod_1.z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim(),
});
exports.updateKitchenSchema = user_validation_1.updateUserProfileSchema.extend({
    address: zod_1.z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim().optional(),
    commercialRegisterImage: file_validation_1.imageSchema.optional(),
    workPermitImage: file_validation_1.imageSchema.optional(),
    commercialRegisterFile: file_validation_1.fileSchema.optional(),
    workPermitFile: file_validation_1.fileSchema.optional(),
});
