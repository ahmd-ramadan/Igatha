import { z } from 'zod';
import { MongoDBObjectId } from '../utils';
import { OrderStatus } from '../enums';


export const createProductOrderSchema = z.object({
    shippingAddressId: z.string().regex(MongoDBObjectId, 'معرف العنوان غير صحيح'),
    // couponCode: z.string().toUpperCase().trim().optional(),
});

export const confirmOrderSchema = z.object({
    orderId: z.string().regex(MongoDBObjectId, 'معرف الطلب غير صحيح'),
});

export const orderParamsSchema = z.object({
    orderCode: z.string().length(6),
});

export const getAllOrdersSchema = z.object({
    kitchenId: z.string().regex(MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    supplierId: z.string().regex(MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    date: z.coerce.date().optional(),
    page: z.coerce.number().positive().int().min(1).default(1).optional(),
    size: z.coerce.number().positive().int().min(1).max(100).default(20).optional(),
});