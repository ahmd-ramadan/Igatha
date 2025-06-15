import { z } from "zod";
import { MongoDBObjectId } from "../utils";
import { SurplusOrderStatus } from "../interfaces";

export const createSurplusOrderSchema = z.object({
    shippingAddressId: z.string().regex(MongoDBObjectId, 'مُعرف العنوان غير صحيح'),
    surplusId: z.string().regex(MongoDBObjectId, 'مُعرف الفائض غير صحيح'),
})

export const getAllSurplusesOrdersSchema = z.object({
    userId: z.string().regex(MongoDBObjectId, 'مُعرف المستخدم غير صحيح').optional(),
    charityId: z.string().regex(MongoDBObjectId, 'مُعرف الجمعية الخيرية غير صحيح').optional(),
    date: z.coerce.date().optional(),
    status: z.nativeEnum(SurplusOrderStatus).optional()
})
