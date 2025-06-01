import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { ApiError, CONFLICT, CREATED, OK } from "../utils";
import { confirmOrderSchema, createProductOrderSchema, getAllOrdersSchema, orderParamsSchema, paginationSchema } from "../validation";
import { UserStatusEnum } from "../enums";
import { productOrderService } from "../services/productOrder.service";

export const createProductOrder = async(req: AuthenticatedRequest, res: Response) => {
    const data = createProductOrderSchema.parse(req.body);
    const kitchenId = req.user?.userId as string;
    const status = req.user?.status as UserStatusEnum;

    if (status !== UserStatusEnum.APPROVED) {
        throw new ApiError('لم يوافق الأدمن علي إنضمامك بعد لايمكنك إجراء أي طلب', CONFLICT)
    }

    const newOrder = await productOrderService.createOrder({ ...data, kitchenId });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء الطلب بنجاح',
        data: newOrder
    })
}

// export const confirmOrder = async(req: AuthenticatedRequest, res: Response) => {
//     const { orderId } = confirmOrderSchema.parse(req.body);
//     const userId = req.user?.userId as string;

//     const confirmedOrder = await productOrderService.confirmOrder(orderId);

//     res.status(OK).json({
//         success: true,
//         message: 'تم تأكيد الطلب بنجاح',
//         data: confirmedOrder
//     })
// }

export const cancelOrder = async(req: AuthenticatedRequest, res: Response) => {
    const { orderId } = confirmOrderSchema.parse(req.body);

    const canceledOrder = await productOrderService.cancelOrder(orderId);

    res.status(OK).json({
        success: true,
        message: 'تم رفض الطلب بنجاح',
        data: canceledOrder
    })
}

export const updateOrderStatus = async(req: AuthenticatedRequest, res: Response) => {
    const { orderId } = confirmOrderSchema.parse(req.body);

    const upadtedOrder = await productOrderService.updateOrderStatus(orderId);

    res.status(OK).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: upadtedOrder
    })
}

export const getOrder = async(req: AuthenticatedRequest, res: Response) => {
    const { orderCode } = orderParamsSchema.parse(req.params);

    const order = await productOrderService.getOrder(orderCode);

    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    })
}

export const getAllOrders = async(req: AuthenticatedRequest, res: Response) => {
    const { page, size } = paginationSchema.parse(req.query);
    const data = getAllOrdersSchema.parse(req.query);
    const orders = await productOrderService.getAllOrders({ ... data, page, size });
   
    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: orders
    })
}