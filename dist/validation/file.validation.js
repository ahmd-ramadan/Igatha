"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSchema = exports.imageSchema = void 0;
const zod_1 = require("zod");
exports.imageSchema = zod_1.z.object({
    fieldname: zod_1.z.string(),
    originalname: zod_1.z.string(),
    encoding: zod_1.z.string(),
    mimetype: zod_1.z.string().refine((val) => val.startsWith("image/"), {
        message: "مسموح بالصور فقط",
    }),
    destination: zod_1.z.string(),
    filename: zod_1.z.string(),
    path: zod_1.z.string(),
    size: zod_1.z.number().max(5 * 1024 * 1024, "حجم الفايل يجب ان يكون أقل من 5 ميجا بايت"),
});
exports.fileSchema = zod_1.z.object({
    fieldname: zod_1.z.string(),
    originalname: zod_1.z.string(),
    encoding: zod_1.z.string(),
    mimetype: zod_1.z.string().refine((val) => val.startsWith("application/pdf"), {
        message: "مسموح فقط لل pdf",
    }),
    destination: zod_1.z.string(),
    filename: zod_1.z.string(),
    path: zod_1.z.string(),
    size: zod_1.z.number().max(5 * 1024 * 1024, "حجم الفايل يجب ان يكون أقل من 5 ميجا بايت"),
});
const uploadImageSchema = zod_1.z.object({
    avatar: zod_1.z.array(exports.imageSchema).min(1, "الصورة الشخصية مطلوبة").max(1),
    medicalLisence: zod_1.z.array(exports.imageSchema).min(1, "الترخيص الطبي مطلوب").max(1),
});
