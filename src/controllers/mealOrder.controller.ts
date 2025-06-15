import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { confirmMealOrderSchema, createMealOrderSchema, getAllMealOrdersSchema, orderMealParamsSchema, paginationSchema } from "../validation";
import { UserStatusEnum } from "../enums";
import { ApiError, CONFLICT, CREATED, OK } from "../utils";
import { mealOrderService } from "../services";

export const createMealOrder = async(req: AuthenticatedRequest, res: Response) => {
    const data = createMealOrderSchema.parse(req.body);
    const campaignId = req.user?.userId as string;
    const status = req.user?.status as UserStatusEnum;

    if (status !== UserStatusEnum.APPROVED) {
        throw new ApiError('لم يوافق الأدمن علي إنضمامك بعد لايمكنك إجراء أي طلب', CONFLICT)
    }

    const newOrder = await mealOrderService.createOrder({ data, campaignId });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء الطلب بنجاح',
        data: newOrder
    })
}

// export const confirmOrder = async(req: AuthenticatedRequest, res: Response) => {
//     const { orderId } = confirmOrderSchema.parse(req.body);
//     const userId = req.user?.userId as string;

//     const confirmedOrder = await mealOrderService.confirmOrder(orderId);

//     res.status(OK).json({
//         success: true,
//         message: 'تم تأكيد الطلب بنجاح',
//         data: confirmedOrder
//     })
// }

export const cancelOrder = async(req: AuthenticatedRequest, res: Response) => {
    const { orderId } = confirmMealOrderSchema.parse(req.body);

    const canceledOrder = await mealOrderService.cancelOrder(orderId);

    res.status(OK).json({
        success: true,
        message: 'تم رفض الطلب بنجاح',
        data: canceledOrder
    })
}

export const updateOrderStatus = async(req: AuthenticatedRequest, res: Response) => {
    const { orderId } = confirmMealOrderSchema.parse(req.body);

    const upadtedOrder = await mealOrderService.updateOrderStatus(orderId);

    res.status(OK).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: upadtedOrder
    })
}

export const getOrder = async(req: AuthenticatedRequest, res: Response) => {
    const { orderCode } = orderMealParamsSchema.parse(req.params);

    const order = await mealOrderService.getOrder(orderCode);

    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    })
}

export const getAllOrders = async(req: AuthenticatedRequest, res: Response) => {
    const { page, size } = paginationSchema.parse(req.query);
    const data = getAllMealOrdersSchema.parse(req.query);
    const orders = await mealOrderService.getAllOrders({ ... data, page, size });
   
    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلبات بنجاح',
        data: orders
    })
}