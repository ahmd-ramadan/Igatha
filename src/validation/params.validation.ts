import { z } from 'zod';
import { MongoDBObjectId } from '../utils';

export const paramsSchema = z.object({
    _id: z.string().regex(MongoDBObjectId, "معرف غير صحيح"),
});

export const slugParamsSchema = z.object({
    slug: z.string()
})