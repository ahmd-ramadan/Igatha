"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    first_name: zod_1.z.string(),
    last_name: zod_1.z.string(),
    phone_number: zod_1.z.string(),
    apartment: zod_1.z.string(),
    floor: zod_1.z.string(),
    building: zod_1.z.string(),
    street: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    postal_code: zod_1.z.string(),
});
exports.updateAddressSchema = zod_1.z.object({
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().optional(),
    apartment: zod_1.z.string().optional(),
    floor: zod_1.z.string().optional(),
    building: zod_1.z.string().optional(),
    street: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    postal_code: zod_1.z.string().optional(),
});
