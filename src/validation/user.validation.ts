import { z } from "zod";
import { UserRolesEnum } from "../enums";
import { imageSchema } from "./file.validation";

export const updateUserProfileSchema = z
.object({
    name: z.coerce.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل').trim().optional(),
    phone: z
        .coerce
        .string()
        .regex(
            /^(?:\+20|0)?(10|11|12|15)\d{8}$/,
            'صيغة رقم الهاتف المصري غير صحيحة',
        )
        .trim().optional(),
    // email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').trim().optional(),
    avatar: imageSchema.optional(),
})

export const updateUserPasswordSchema = z
.object({
    oldPassword: z
            .string()
            .regex(
                /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
                'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل',
            )
            .trim(),
    newPassword: z
            .string()
            .regex(
                /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
                'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، رقم واحد، حرف خاص واحد، وحرف واحد على الأقل',
            )
            .trim(),
})

export const getAllUsersSchema = z.object({
    role: z.nativeEnum(UserRolesEnum).optional(),
})

export const searchOnDoctorSchema = z.object({
    q: z.string(),
})