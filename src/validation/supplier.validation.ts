import { z } from "zod";
import { registerSchema } from "./auth.validation";
import { fileSchema, imageSchema } from "./file.validation";
import { updateUserProfileSchema } from "./user.validation";

export const createSupplierSchema = registerSchema.extend({
    commercialRegisterImage: imageSchema.optional(),
    workPermitImage: imageSchema.optional(),
    commercialRegisterFile: fileSchema.optional(),
    workPermitFile: fileSchema.optional(),
    address: z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim(),
})
// .refine((data) => {
//     return !!(data.commercialRegisterImage || data.commercialRegisterFile);
// }, {
//     message: 'يجب أن يكون إما صورة أو ملف للسجل التجاري',
// }).refine((data) => {
//    return !!(data.workPermitFile || data.workPermitImage);
// }, {
//     message: 'يجب أن يكون إما صورة أو ملف للإذن العمل',
// })

export const updateSupplierSchema = updateUserProfileSchema.extend({
    commercialRegisterImage: imageSchema.optional(),
    workPermitImage: imageSchema.optional(),
    commercialRegisterFile: fileSchema.optional(),
    workPermitFile: fileSchema.optional(),
    address: z.string().min(3, 'يجب أن يكون العنوان أطول من 3 أحرف').trim().optional(),
})