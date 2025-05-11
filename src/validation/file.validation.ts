import { z } from "zod";
import { Request } from "express";
import { BAD_REQUEST, ApiError } from "../utils";

export const imageSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine((val) => val.startsWith("image/"), {
    message: "مسموح بالصور فقط",
  }),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number().max(5 * 1024 * 1024, "حجم الفايل يجب ان يكون أقل من 5 ميجا بايت"),
});

export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine((val) => val.startsWith("application/pdf"), {
    message: "مسموح فقط لل pdf",
  }),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number().max(5 * 1024 * 1024, "حجم الفايل يجب ان يكون أقل من 5 ميجا بايت"),
});

const uploadImageSchema = z.object({
  avatar: z.array(imageSchema).min(1, "الصورة الشخصية مطلوبة").max(1),
  medicalLisence: z.array(imageSchema).min(1, "الترخيص الطبي مطلوب").max(1),
});
