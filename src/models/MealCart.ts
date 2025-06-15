import { model, Schema } from "mongoose";
import { IMealCartModel, IProductCartModel } from "../interfaces"

const mealCartSchema = new Schema({
    campaignId: { 
        type: Schema.Types.ObjectId, 
        ref: "Kitchen",
        required: true
    },
    meals: [
        {
            mealId: {
                type: Schema.Types.ObjectId,
                ref: 'Meal',
                required: true
            },
            kitchenId: {
                type: Schema.Types.ObjectId,
                ref: 'Kitchen',
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            note: {
                type: String,
                required: false
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});


mealCartSchema.virtual('campaignData', {
    ref: 'Campaign',
    localField: 'campaignId',
    foreignField: '_id',
    justOne: true,
    options: { 
        select: 'name avatar role rating'
    }  
});

mealCartSchema.virtual('mealsData', {
    ref: 'Meal',
    localField: 'meals.productId',
    foreignField: '_id',
    justOne: false,
    options: {
        select: 'appliedPrice images title slug desc minimumOrderQuantity',
        populate: {
            path: 'supplierData'
        }
    }  
});



export const MealCart = model<IMealCartModel>("MealCart", mealCartSchema);