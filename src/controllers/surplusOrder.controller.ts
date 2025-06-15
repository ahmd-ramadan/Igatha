import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { codeParamsSchema, createSurplusOrderSchema, getAllSurplusesOrdersSchema, paginationSchema, paramsSchema } from "../validation";
import { UserStatusEnum } from "../enums";
import { ApiError, CONFLICT, CREATED, OK } from "../utils";
import { surplusOrderService } from "../services";

export const createSurplusOrder = async(req: AuthenticatedRequest, res: Response) => {
    const data = createSurplusOrderSchema.parse(req.body);
    const charityId = req.user?.userId as string;
    const status = req.user?.status as UserStatusEnum;

    if (status !== UserStatusEnum.APPROVED) {
        throw new ApiError('لم يوافق الأدمن علي إنضمامك بعد لايمكنك إجراء أي طلب', CONFLICT)
    }

    const newOrder = await surplusOrderService.createOrder({ data, charityId });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء الطلب بنجاح',
        data: newOrder
    })
}

export const updateOrderStatus = async(req: AuthenticatedRequest, res: Response) => {
    const { _id: orderId } = paramsSchema.parse(req.params);

    const upadtedOrder = await surplusOrderService.updateSurplusOrderStatus(orderId);

    res.status(OK).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: upadtedOrder
    })
}

export const getOrder = async(req: AuthenticatedRequest, res: Response) => {
    const { code: orderCode } = codeParamsSchema.parse(req.params);

    const order = await surplusOrderService.getOrder(orderCode);

    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    })
}

export const getAllOrders = async(req: AuthenticatedRequest, res: Response) => {
    const { page, size } = paginationSchema.parse(req.query);
    const data = getAllSurplusesOrdersSchema.parse(req.query);
    const orders = await surplusOrderService.getAllOrders({ ... data, page, size });
   
    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلبات بنجاح',
        data: orders
    })
}