import { Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { adminAddNoteOnMealSchema, createMealSchema, getAllMealssSchema, slugParamsSchema, updateMealSchema } from "../validation";
import { UserStatusEnum } from "../enums";
import { mealService } from "../services";
import { CREATED, OK } from "../utils";


export const createMeal = async (req: AuthenticatedRequest, res: Response) => {
    const data = createMealSchema.parse(req.body);
    const { userId: kitchenId, status: kitchenStatus } = req?.user as { userId: string, status: UserStatusEnum };
    const files = req.files;

    const createdMeal = await mealService.createMeal({ kitchenStatus, kitchenId, data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء الوجبة بنجاح',
        data: createdMeal
    });
}

export const updateMeal = async (req: AuthenticatedRequest, res: Response) => {
    const { slug: mealSlug } = slugParamsSchema.parse(req.params);
    const data = updateMealSchema.parse(req.body);
    const kitchenId = req?.user?.userId as string;
    const files = req.files;

    const updatedMeal = await mealService.updateMeal({ mealSlug, kitchenId, data, files });

    res.status(OK).json({
        success: true,
        message: 'تم تحديث الوجبة بنجاح',
        data: updatedMeal
    });
}

export const deleteMeal = async (req: AuthenticatedRequest, res: Response) => {
    const { slug: mealSlug } = slugParamsSchema.parse(req.params);
    const kitchenId = req?.user?.userId as string;

    const deletedMeal = await mealService.deleteMeal({ mealSlug, kitchenId });

    res.status(OK).json({
        success: true,
        message: 'تم حذف الوجبة بنجاح',
        data: deletedMeal
    });
}

export const getAllMeals = async (req: Request, res: Response) => {
    const { page, size, search, fromPrice, toPrice, kitchenId } = getAllMealssSchema.parse(req.query);
    const meals = await mealService.getAllMeals({ page, size, search, fromPrice, toPrice, kitchenId });

    res.status(OK).json({
        success: true,
        message: 'تم جلب الوجبات بنجاح',
        data: meals
    });
}

export const getMeal = async (req: Request, res: Response) => {
    const { slug: mealSlug } = slugParamsSchema.parse(req.params);
    const meal = await mealService.findMealBySlug(mealSlug);

    res.status(OK).json({
        success: true,
        message: 'تم جلب الوجبة بنجاح',
        data: meal
    });
}

export const adminAddNoteOnMeal = async (req: AuthenticatedRequest, res: Response) => {
    const { slug: mealSlug } = slugParamsSchema.parse(req.params);
    const { note } = adminAddNoteOnMealSchema.parse(req.body);

    const updatedMeal = await mealService.adminAddNoteToMeal({ mealSlug, note });

    res.status(OK).json({
        success: true,
        message: 'تم إضافة الملاحظة بنجاح',
        data: updatedMeal
    });
}

