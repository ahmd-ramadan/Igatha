"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.charityRegisterSchema = void 0;
const zod_1 = require("zod");
const auth_validation_1 = require("./auth.validation");
const enums_1 = require("../enums");
exports.charityRegisterSchema = auth_validation_1.registerSchema.extend({
    role: zod_1.z.nativeEnum(enums_1.UserRolesEnum).default(enums_1.UserRolesEnum.CHARITY),
});
