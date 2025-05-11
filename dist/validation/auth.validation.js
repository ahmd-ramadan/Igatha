"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyOtpSchema = exports.forgotPasswordSchema = exports.resendVerificationEmailSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const file_validation_1 = require("./file.validation");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.coerce.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل').trim(),
    email: zod_1.z.coerce.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
    phone: zod_1.z
        .coerce
        .string()
        .regex(/^(?:\+20|0)?(10|11|12|15)\d{8}$/, 'صيغة رقم الهاتف المصري غير صحيحة')
        .trim(),
    password: zod_1.z
        .coerce
        .string()
        .regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل')
        .trim(),
    avatar: file_validation_1.imageSchema.optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
    password: zod_1.z.string().regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل'),
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().trim(),
});
exports.resendVerificationEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
    otp: zod_1.z.string().length(6, 'رمز التحقق غير صحيح').trim(),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().regex(/^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/, 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل'),
    otp: zod_1.z.string().length(6, 'رمز التحقق غير صحيح').trim(),
});
