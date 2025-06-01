import { z } from 'zod';
import { MongoDBObjectId } from '../utils';
import { OrderStatus } from '../enums';


export const confirmSubOrderSchema = z.object({
    orderId: z.string().regex(MongoDBObjectId, 'معرف الطلب غير صحيح'),
});

export const getAllSubOrdersSchema = z.object({
    supplierId: z.string().regex(MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    date: z.coerce.date().optional(),
    page: z.coerce.number().positive().int().min(1).default(1).optional(),
    size: z.coerce.number().positive().int().min(1).max(100).default(20).optional(),
});