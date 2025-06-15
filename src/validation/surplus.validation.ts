import { z } from "zod";
import { MongoDBObjectId } from "../utils";

export const createSurplusSchema = z.object({
    title: z.string().max(1000),
    description: z.string().max(1000)
})

export const updateSurplusSchema = z.object({
    title: z.string().max(1000).optional(),
    description: z.string().max(1000).optional(),
    updatedImagesIds: z.union([z.string(), z.array(z.string())])
    .transform(ids => {
        if (typeof ids === 'string') {
            return [ids];
        }
        return ids;
    }).optional(),
    deletedImagesIds: z.union([z.string(), z.array(z.string())])
        .transform(ids => {
            if (typeof ids === 'string') {
                return [ids];
            }
            return ids;
        }).optional()
})

export const getAllSurplusesSchema = z.object({
    userId: z.string().regex(MongoDBObjectId, 'مُعرف المستخدم غير صحيح').optional()
})

export const adminAddNoteOnSurplusSchema = z.object({
    note: z.string()
})
