import { IMealCart } from "../interfaces";
import { mealCartRepository } from "../repositories";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR } from "../utils";
import { mealService } from "./meal.service";


class MealCartService {

    private readonly populatedArray = ['campaignData', 'mealsData']
    constructor(private readonly mealCartDataSource = mealCartRepository) {}  

    async isMealCartExists(campaignId: string) {
        const mealCart = await this.findMealCartByCampaignId(campaignId) as IMealCart;
        if (!mealCart) {
            throw new ApiError('السلة غير موجودة', CONFLICT);
        }
        return mealCart;
    }

    async isMealAvailble({ mealId, quantity }: { mealId: string, quantity: number }) {
        const meal = await mealService.isMealExist(mealId);
        const { stock, isDeleted, isActive, title } = meal;
        if (isDeleted || !isActive) {
            throw new ApiError(`الوجبة ${title} غير متاحة الان`, CONFLICT)
        }
        if (stock < quantity) {
            throw new ApiError(`الكمية المطلوبة ${quantity} أكثر من المتاح ${stock} للوجبة ${title}`, CONFLICT);
        }
        return meal;
    }

    async findMealCartByCampaignId(campaignId: string) {
        return await this.mealCartDataSource.findOneWithPopulate({ campaignId }, this.populatedArray)
    }

    async addMealToMealCart({ campaignId, mealId, quantity, note }: { campaignId: string, mealId: string, quantity: number, note?: string }) {
        try {
            const { appliedPrice: price, kitchenId } = await this.isMealAvailble({ mealId, quantity });

            let mealCart = await this.findMealCartByCampaignId(campaignId);
            if (!mealCart) {
                mealCart = await this.mealCartDataSource.createOne({
                    campaignId,
                    meals: [
                        { mealId, kitchenId, price, quantity, note: note || "" }
                    ]
                }) as IMealCart;
            }
            
            let { meals, totalPrice } = mealCart;
        
            meals = meals.filter(meal => meal.mealId.toString() !== mealId.toString());
            meals.push({ mealId, kitchenId, price, quantity, note: note || "" });
            totalPrice = meals.reduce((acc, meal) => acc + meal.price * meal.quantity, 0);

            const updatedMealCart = await this.mealCartDataSource.updateOne({ _id: mealCart._id, campaignId }, { meals, totalPrice }, this.populatedArray);

            return updatedMealCart;
        } catch(error) {
            console.log(error)
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة الوجبة إلى السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async removeMealFromMealCart({ campaignId, mealId }: { campaignId: string, mealId: string }) {
        try {
            const mealCart = await this.findMealCartByCampaignId(campaignId) as IMealCart;
            if (!mealCart) {
                throw new ApiError('السلة غير موجودة', CONFLICT);
            }

            let { meals, totalPrice } = mealCart;
            meals = meals.filter(meal => meal.mealId.toString() !== mealId.toString());
            totalPrice = meals.reduce((acc, meal) => acc + meal.price * meal.quantity, 0);
            
            if (meals.length === 0) {
                return await this.cleaMealsCart(campaignId);
            } else {
                const updatedMealCart = await this.mealCartDataSource.updateOne({ _id: mealCart._id, campaignId }, { meals, totalPrice }, this.populatedArray);
                return updatedMealCart;
            }
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إزالة الوجبة من السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async getCampaignMealCart({ campaignId }: { campaignId: string }) {
        try {
            const mealCart = await this.findMealCartByCampaignId(campaignId) as IMealCart;
            if (!mealCart) {
                throw new ApiError('السلة غير موجودة', CONFLICT);
            }
            return mealCart;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء جلب السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async cleaMealsCart(campaignId: string) {
        try {
            return await this.mealCartDataSource.deleteOne({ campaignId });
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إزالة السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async clearMealsCartForKitchen({ campaignId, kitchenId }: { campaignId: string, kitchenId: string }) {
        try {
            const userCart = await this.isMealCartExists(campaignId);
            const newMeals = userCart.meals.filter(m => m.kitchenId.toString() !== kitchenId.toString());
            if(newMeals.length == 0) return await this.cleaMealsCart(campaignId);
            else return await this.mealCartDataSource.updateOne({ campaignId }, { meals: newMeals });
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إزالة السلة', INTERNAL_SERVER_ERROR);
        }
    }

    
}

export const mealCartService = new MealCartService();