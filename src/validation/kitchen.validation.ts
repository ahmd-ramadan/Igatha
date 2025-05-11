import { z } from "zod";
import { registerSchema } from "./auth.validation";
import { imageSchema, fileSchema } from "./file.validation";
import { updateUserProfileSchema } from "./user.validation";

export const createKitchenSchema = registerSchema.extend({
    commercialRegisterImage: imageSchema.optional(),
    workPermitImage: imageSchema.optional(),
    commercialRegisterFile: fileSchema.optional(),
    workPermitFile: fileSchema.optional(),
    address: z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim(),

})

export const updateKitchenSchema = updateUserProfileSchema.extend({
    address: z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim().optional(),
    commercialRegisterImage: imageSchema.optional(),
    workPermitImage: imageSchema.optional(),
    commercialRegisterFile: fileSchema.optional(),
    workPermitFile: fileSchema.optional(),
})

