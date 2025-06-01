"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsSchema = exports.adminAddNoteOnProductSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(5),
    desc: zod_1.z.string().min(5),
    price: zod_1.z.coerce.number().min(1),
    discount: zod_1.z.coerce.number().min(0).max(100).optional(),
    // images: z.array(imageSchema),
    stock: zod_1.z.coerce.number().min(1),
    minimumOrderQuantity: zod_1.z.coerce.number().min(1)
});
exports.updateProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).optional(),
    desc: zod_1.z.string().min(5).optional(),
    price: zod_1.z.coerce.number().min(1).optional(),
    discount: zod_1.z.coerce.number().min(0).max(100).optional(),
    stock: zod_1.z.coerce.number().min(1).optional(),
    minimumOrderQuantity: zod_1.z.coerce.number().min(1).optional(),
    updatedImagesIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .transform(ids => {
        if (typeof ids === 'string') {
            return [ids];
        }
        return ids;
    }).optional(),
    deletedImagesIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .transform(ids => {
        if (typeof ids === 'string') {
            return [ids];
        }
        return ids;
    }).optional()
});
exports.adminAddNoteOnProductSchema = zod_1.z.object({
    note: zod_1.z.string()
});
exports.getAllProductsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    size: zod_1.z.coerce.number().min(1).max(100, 'Many documents per page, enter less than 100').default(20),
    supplierId: zod_1.z.string().optional(),
    // isActive: z.boolean().optional(),
    // isDeleted: z.boolean().optional(),
    fromPrice: zod_1.z.coerce.number().optional(),
    toPrice: zod_1.z.coerce.number().optional(),
    search: zod_1.z.string().optional()
});
