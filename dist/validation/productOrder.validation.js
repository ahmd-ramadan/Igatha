"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersSchema = exports.orderParamsSchema = exports.confirmOrderSchema = exports.createProductOrderSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
exports.createProductOrderSchema = zod_1.z.object({
    shippingAddressId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'معرف العنوان غير صحيح'),
    // couponCode: z.string().toUpperCase().trim().optional(),
});
exports.confirmOrderSchema = zod_1.z.object({
    orderId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'معرف الطلب غير صحيح'),
});
exports.orderParamsSchema = zod_1.z.object({
    orderCode: zod_1.z.string().length(6),
});
exports.getAllOrdersSchema = zod_1.z.object({
    kitchenId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    supplierId: zod_1.z.string().regex(utils_1.MongoDBObjectId, 'مَعرف المستخدم غير صحيح').optional(),
    status: zod_1.z.nativeEnum(enums_1.OrderStatus).optional(),
    date: zod_1.z.coerce.date().optional(),
    page: zod_1.z.coerce.number().positive().int().min(1).default(1).optional(),
    size: zod_1.z.coerce.number().positive().int().min(1).max(100).default(20).optional(),
});
