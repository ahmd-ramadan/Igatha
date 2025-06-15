import { Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { adminAddNoteOnSurplusSchema, createSurplusSchema, getAllSurplusesSchema, paginationSchema, paramsSchema, updateSurplusSchema } from "../validation";
import { UserStatusEnum } from "../enums";
import { surplusService } from "../services";
import { CREATED, OK } from "../utils";


export const createSurplus = async (req: AuthenticatedRequest, res: Response) => {
    const data = createSurplusSchema.parse(req.body);
    const { userId, status: userStatus } = req?.user as { userId: string, status: UserStatusEnum };
    const files = req.files;

    const createdSurplus = await surplusService.createSurplus({ userId, userStatus, data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء الفائض بنجاح',
        data: createdSurplus
    });
}

export const updateSurplus = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: surplusId } = paramsSchema.parse(req.params);
    const data = updateSurplusSchema.parse(req.body);
    const userId = req?.user?.userId as string;
    const files = req.files;

    const updatedSurplus = await surplusService.updateSurplus({ surplusId, userId, data, files });

    res.status(OK).json({
        success: true,
        message: 'تم تحديث الفائض بنجاح',
        data: updatedSurplus
    });
}

export const deleteSurplus = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: surplusId } = paramsSchema.parse(req.params);
    const userId = req?.user?.userId as string;

    const deletedSurplus = await surplusService.deleteSurplus({ surplusId, userId });

    res.status(OK).json({
        success: true,
        message: 'تم حذف الفائض بنجاح',
        data: deletedSurplus
    });
}

export const getAllSurpluses = async (req: Request, res: Response) => {
    const { page, size} = paginationSchema.parse(req.query);
    const data = getAllSurplusesSchema.parse(req.query);
    const surpluses = await surplusService.getAllSurpluss({ ...data, page, size });

    res.status(OK).json({
        success: true,
        message: 'تم جلب كل الفائض بنجاح',
        data: surpluses
    });
}

export const getSurplus = async (req: Request, res: Response) => {
    const { _id: surplusId } = paramsSchema.parse(req.params);

    const surplus = await surplusService.isSurplusExist(surplusId);

    res.status(OK).json({
        success: true,
        message: 'تم جلب الفائض بنجاح',
        data: surplus
    });
}

export const adminAddNoteOnSurplus = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: surplusId } = paramsSchema.parse(req.params);
    const { note } = adminAddNoteOnSurplusSchema.parse(req.body);

    const updatedSurplus = await surplusService.adminAddNoteToSurplus({ surplusId, note });

    res.status(OK).json({
        success: true,
        message: 'تم إضافة الملاحظة بنجاح',
        data: updatedSurplus
    });
}

