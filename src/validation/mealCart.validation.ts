import { z } from "zod"
import { MongoDBObjectId } from "../utils"

export const addMealToMealCartSchema = z.object({
    mealId: z.string().regex(MongoDBObjectId, 'مُعرف الوجبة غير صحيح'),
    quantity: z.number().min(1),
    note: z.string().optional()
}) 

export const removeMealFromMealCartSchema = z.object({
    mealId: z.string().regex(MongoDBObjectId, 'مُعرف الوجبة غير صحيح'),
})



