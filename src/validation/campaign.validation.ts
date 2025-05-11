import { z } from "zod";
import { registerSchema } from "./auth.validation";
import { fileSchema, imageSchema } from "./file.validation";
import { updateUserProfileSchema } from "./user.validation";

export const createCampaignSchema = registerSchema.extend({
    pilgrimsCount: z.coerce.number().min(1, 'يجب أن يكون عدد الحجاج أكبر من 0').max(1000000, 'يجب أن يكون عدد الحجاج أقل من 1000000'),
    country: z.coerce.string().min(3, 'يجب أن يكون اسم البلد 3 أحرف على الأقل').trim(),
    // commercialRegisterImage: imageSchema.optional(),
    // hajjReferenceImage: imageSchema.optional(),
    // hajjReferenceFile: fileSchema.optional(),
    // commercialRegisterFile: fileSchema.optional(),
})
// .refine((data) => {
//     return !(data.hajjReferenceImage === undefined && data.hajjReferenceFile === undefined)
// }, {
//     message: 'يجب ان يحتوي الطلب علي صورة أو فايل لتصريح الحج',
//     path: ['hajjReferenceFile', 'hajjReferenceImage']
// })

export const updateCampaignSchema = updateUserProfileSchema.extend({
    pilgrimsCount: z.coerce.number().min(1, 'يجب أن يكون عدد الحجاج أكبر من 0').max(1000000, 'يجب أن يكون عدد الحجاج أقل من 1000000').optional(),
    country: z.coerce.string().min(3, 'يجب أن يكون اسم البلد 3 أحرف على الأقل').trim().optional(),
})
// .refine((data) => {
//     // إذا كان هناك رقم السجل التجاري، يجب أن يكون هناك صورة
//     if (data.commercialRegisterNumber) {
//         return !!data.commercialRegisterImage;
//     }
//     // إذا كان هناك صورة السجل التجاري، يجب أن يكون هناك رقم
//     if (data.commercialRegisterImage) {
//         return !!data.commercialRegisterNumber;
//     }
//     return true;
// }, {
//     message: 'يجب رفع صورة السجل التجاري عند إدخال الرقم، وإدخال الرقم عند رفع الصورة',
//     path: ['commercialRegisterNumber']
// }).refine((data) => {
//     // إذا كان هناك رقم إشارة الحج العربي، يجب أن يكون هناك صورة
//     if (data.hajjReferenceArabicNumber) {
//         return !!data.hajjReferenceArabicImage;
//     }
//     // إذا كان هناك صورة إشارة الحج العربي، يجب أن يكون هناك رقم
//     if (data.hajjReferenceArabicImage) {
//         return !!data.hajjReferenceArabicNumber;
//     }
//     return true;
// }, {
//     message: 'يجب رفع صورة إشارة الحج العربي عند إدخال الرقم، وإدخال الرقم عند رفع الصورة',
//     path: ['hajjReferenceArabicNumber']
// }).refine((data) => {
//     // إذا كان هناك رقم إشارة الحج الأجنبي، يجب أن يكون هناك صورة
//     if (data.hajjReferenceForeignNumber) {
//         return !!data.hajjReferenceForeignImage;
//     }
//     // إذا كان هناك صورة إشارة الحج الأجنبي، يجب أن يكون هناك رقم
//     if (data.hajjReferenceForeignImage) {
//         return !!data.hajjReferenceForeignNumber;
//     }
//     return true;
// }, {
//     message: 'يجب رفع صورة إشارة الحج الأجنبي عند إدخال الرقم، وإدخال الرقم عند رفع الصورة',
//     path: ['hajjReferenceForeignNumber']
// });