import { z } from "zod";
import { registerSchema } from "./auth.validation";
import { fileSchema, imageSchema } from "./file.validation";
import { updateUserProfileSchema } from "./user.validation";

export const createCharitySchema = registerSchema.extend({
    workPermitImage: imageSchema.optional(),
    workPermitFile: fileSchema.optional(),
    address: z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim(),
})

export const updateCharitySchema = updateUserProfileSchema.extend({
    workPermitImage: imageSchema.optional(),
    workPermitFile: fileSchema.optional(),
    address: z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim().optional(),
})