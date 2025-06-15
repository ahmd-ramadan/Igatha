import { z } from 'zod';
import { MongoDBObjectId } from '../utils';
import { OrderStatus } from '../enums';


export const createMealOrderSchema = z.object({
    shippingAddressId: z.string().regex(MongoDBObjectId, 'معرف العنوان غير صحيح'),
    kitchenId: z.string().regex(MongoDBObjectId, 'معرف مركز الإعاشة غير صحيح'),
    // couponCode: z.string().toUpperCase().trim().optional(),
});

export const confirmMealOrderSchema = z.object({
    orderId: z.string().regex(MongoDBObjectId, 'معرف الطلب غير صحيح'),
});

export const orderMealParamsSchema = z.object({
    orderCode: z.string().length(6),
});

export const getAllMealOrdersSchema = z.object({
    kitchenId: z.string().regex(MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    campaignId: z.string().regex(MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    date: z.coerce.date().optional(),
    page: z.coerce.number().positive().int().min(1).default(1).optional(),
    size: z.coerce.number().positive().int().min(1).max(100).default(20).optional(),
});