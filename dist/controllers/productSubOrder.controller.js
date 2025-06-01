"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.getOrderById = exports.getOrderByCode = exports.updateOrderStatus = void 0;
const validation_1 = require("../validation");
const services_1 = require("../services");
const utils_1 = require("../utils");
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
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id: orderId } = validation_1.paramsSchema.parse(req.params);
    const supplierId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const upadtedOrder = yield services_1.productSubOrderService.updateOrderStatus({ supplierId, orderId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: upadtedOrder
    });
});
exports.updateOrderStatus = updateOrderStatus;
const getOrderByCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orderCode } = validation_1.orderParamsSchema.parse(req.params);
    const supplierId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const order = yield services_1.productSubOrderService.getSupplierOrderByCode({ orderCode, supplierId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    });
});
exports.getOrderByCode = getOrderByCode;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id: orderId } = validation_1.paramsSchema.parse(req.params);
    const supplierId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const order = yield services_1.productSubOrderService.getSupplierOrderById({ orderId, supplierId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    });
});
exports.getOrderById = getOrderById;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, size } = validation_1.paginationSchema.parse(req.query);
    const data = validation_1.getAllSubOrdersSchema.parse(req.query);
    const orders = yield services_1.productSubOrderService.getAllSubOrders(Object.assign(Object.assign({}, data), { page, size }));
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع كل الطلبات بنجاح',
        data: orders
    });
});
exports.getAllOrders = getAllOrders;
