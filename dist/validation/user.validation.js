"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOnDoctorSchema = exports.getAllUsersSchema = exports.updateUserPasswordSchema = exports.updateUserProfileSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const file_validation_1 = require("./file.validation");
exports.updateUserProfileSchema = zod_1.z
    .object({
    name: zod_1.z.coerce.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل').trim().optional(),
    phone: zod_1.z
        .coerce
        .string()
        .regex(/^(?:\+20|0)?(10|11|12|15)\d{8}$/, 'صيغة رقم الهاتف المصري غير صحيحة')
        .trim().optional(),
    // email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').trim().optional(),
    avatar: file_validation_1.imageSchema.optional(),
});
exports.updateUserPasswordSchema = zod_1.z
    .object({
    oldPassword: zod_1.z
        .string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل')
        .trim(),
    newPassword: zod_1.z
        .string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل')
        .trim(),
});
exports.getAllUsersSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(enums_1.UserRolesEnum).optional(),
});
exports.searchOnDoctorSchema = zod_1.z.object({
    q: zod_1.z.string(),
});
