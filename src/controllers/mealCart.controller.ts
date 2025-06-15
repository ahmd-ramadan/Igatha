import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { addMealToMealCartSchema, removeMealFromMealCartSchema } from "../validation";
import { mealCartService } from "../services";
import { OK } from "../utils";

export const addMealToMealCart = async (req: AuthenticatedRequest, res: Response) => {
    const campaignId = req?.user?.userId as string;
    const { mealId, quantity, note } = addMealToMealCartSchema.parse(req.body);

    const mealCart = await mealCartService.addMealToMealCart({ campaignId, mealId, quantity, note });

    res.status(OK).json({
        success: true,
        message: 'تم إضافة الوجبة بنجاح',
        data: mealCart
    });
}

export const removeMealFromMealCart = async (req: AuthenticatedRequest, res: Response) => {
    const campaignId = req?.user?.userId as string;
    const { mealId } = removeMealFromMealCartSchema.parse(req.body);

    const mealCart = await mealCartService.removeMealFromMealCart({ campaignId, mealId });

    res.status(OK).json({
        success: true,
        message: 'تم إزالة الوجبة من السلة بنجاح',
        data: mealCart
    });
}

export const getCampaignMealCart = async (req: AuthenticatedRequest, res: Response) => {
    const campaignId = req?.user?.userId as string;

    const mealCart = await mealCartService.getCampaignMealCart({ campaignId });

    res.status(OK).json({
        success: true,
        message: 'تم جلب السلة بنجاح',
        data: mealCart
    });
}

export const clearMealCart = async (req: AuthenticatedRequest, res: Response) => {
    const campaignId = req?.user?.userId as string;

    const mealCart = await mealCartService.cleaMealsCart(campaignId);

    res.status(OK).json({
        success: true,
        message: 'تم إزالة السلة بنجاح',
        data: mealCart
    });
}