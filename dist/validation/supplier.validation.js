"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRegisterSchema = void 0;
const zod_1 = require("zod");
const auth_validation_1 = require("./auth.validation");
const enums_1 = require("../enums");
const file_validation_1 = require("./file.validation");
exports.supplierRegisterSchema = auth_validation_1.registerSchema.extend({
    role: zod_1.z.nativeEnum(enums_1.UserRolesEnum).default(enums_1.UserRolesEnum.SUPPLIER),
    businessLicense: zod_1.z.object({
        file: file_validation_1.imageSchema,
        number: zod_1.z.string()
    }),
});
