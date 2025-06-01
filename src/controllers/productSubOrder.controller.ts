
import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { getAllSubOrdersSchema, orderParamsSchema, paginationSchema, paramsSchema } from "../validation";
import { productSubOrderService } from "../services";
import { OK } from "../utils";

// export const confirmOrder = async(req: AuthenticatedRequest, res: Response) => {
//     const { orderId } = confirmSubOrderSchema.parse(req.body);
//     const userId = req.user?.userId as string;

//     const confirmedOrder = await productSubOrderService.confirmOrder(orderId);

//     res.status(OK).json({
//         success: true,
//         message: 'تم تأكيد الطلب بنجاح',
//         data: confirmedOrder
//     })
// }

// export const cancelOrder = async(req: AuthenticatedRequest, res: Response) => {
//     const { orderId } = confirmSubOrderSchema.parse(req.body);

//     const canceledOrder = await productSubOrderService.cancelOrder(orderId);

//     res.status(OK).json({
//         success: true,
//         message: 'تم رفض الطلب بنجاح',
//         data: canceledOrder
//     })
// }

export const updateOrderStatus = async(req: AuthenticatedRequest, res: Response) => {
    const { _id: orderId } = paramsSchema.parse(req.params);
    const supplierId = req.user?.userId as string;

    const upadtedOrder = await productSubOrderService.updateOrderStatus({ supplierId, orderId });

    res.status(OK).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: upadtedOrder
    })
}

export const getOrderByCode = async(req: AuthenticatedRequest, res: Response) => {
    const { orderCode } = orderParamsSchema.parse(req.params);
    const supplierId = req.user?.userId as string;

    const order = await productSubOrderService.getSupplierOrderByCode({ orderCode, supplierId });

    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    })
}

export const getOrderById = async(req: AuthenticatedRequest, res: Response) => {
    const { _id: orderId } = paramsSchema.parse(req.params);
    const supplierId = req.user?.userId as string;

    const order = await productSubOrderService.getSupplierOrderById({ orderId, supplierId });

    res.status(OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    })
}

export const getAllOrders = async(req: AuthenticatedRequest, res: Response) => {
    const { page, size } = paginationSchema.parse(req.query);
    const data = getAllSubOrdersSchema.parse(req.query);
    
    const orders = await productSubOrderService.getAllSubOrders({ ...data, page, size });
   
    res.status(OK).json({
        success: true,
        message: 'تم إرجاع كل الطلبات بنجاح',
        data: orders
    })
}