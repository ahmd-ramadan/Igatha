import { z } from "zod";
import { imageSchema } from "./file.validation";

export const createProductSchema = z.object({
    title: z.string().min(5),
    desc: z.string().min(5),
    price: z.coerce.number().min(1),
    discount: z.coerce.number().min(0).max(100).optional(),
    // images: z.array(imageSchema),
    stock: z.coerce.number().min(1),
    minimumOrderQuantity: z.coerce.number().min(1)
});

export const updateProductSchema = z.object({
    title: z.string().min(5).optional(),
    desc: z.string().min(5).optional(),
    price: z.coerce.number().min(1).optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
    stock: z.coerce.number().min(1).optional(),
    minimumOrderQuantity: z.coerce.number().min(1).optional(),
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
});

export const adminAddNoteOnProductSchema = z.object({
    note: z.string()
})

export  const getAllProductsSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100, 'Many documents per page, enter less than 100').default(20),
    supplierId: z.string().optional(),
    // isActive: z.boolean().optional(),
    // isDeleted: z.boolean().optional(),
    fromPrice: z.coerce.number().optional(),
    toPrice: z.coerce.number().optional(),
    search: z.string().optional() 
})
