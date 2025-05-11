import { z } from 'zod';
import { UserRolesEnum } from '../enums';
import { imageSchema } from './file.validation';

export const registerSchema = z.object({
    name: z.coerce.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل').trim(),
    email: z.coerce.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
    phone: z
        .coerce
        .string()
        .regex(
            /^(?:\+20|0)?(10|11|12|15)\d{8}$/,
            'صيغة رقم الهاتف المصري غير صحيحة',
        )
        .trim(),
    password: z
        .coerce
        .string()
        .regex(
            /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
            'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل',
        )
        .trim(),
    avatar: imageSchema.optional()

})


export const loginSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
  password: z.string().regex(
    /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
    'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل',
  ),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim(),
});

export const resendVerificationEmailSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').toLowerCase().trim(),
  otp: z.string().length(6, 'رمز التحقق غير صحيح').trim(),
});

export const resetPasswordSchema = z.object({
  password: z.string().regex(
    /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
    'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل',
  ),
  otp: z.string().length(6, 'رمز التحقق غير صحيح').trim(),
});