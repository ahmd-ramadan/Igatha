import { z } from "zod"
import { MongoDBObjectId } from "../utils"

export const addPrdocutToProductCartSchema = z.object({
    productId: z.string().regex(MongoDBObjectId),
    quantity: z.number().min(1),
    note: z.string().optional()
}) 

export const removeProductfromProductCartSchema = z.object({
    productId: z.string().regex(MongoDBObjectId)
})



