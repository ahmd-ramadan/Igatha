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
exports.getAllOrders = exports.getOrder = exports.updateOrderStatus = exports.cancelOrder = exports.createProductOrder = void 0;
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const enums_1 = require("../enums");
const productOrder_service_1 = require("../services/productOrder.service");
const createProductOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = validation_1.createProductOrderSchema.parse(req.body);
    const kitchenId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const status = (_b = req.user) === null || _b === void 0 ? void 0 : _b.status;
    if (status !== enums_1.UserStatusEnum.APPROVED) {
        throw new utils_1.ApiError('لم يوافق الأدمن علي إنضمامك بعد لايمكنك إجراء أي طلب', utils_1.CONFLICT);
    }
    const newOrder = yield productOrder_service_1.productOrderService.createOrder(Object.assign(Object.assign({}, data), { kitchenId }));
    res.status(utils_1.CREATED).json({
        success: true,
        message: 'تم إنشاء الطلب بنجاح',
        data: newOrder
    });
});
exports.createProductOrder = createProductOrder;
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
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = validation_1.confirmOrderSchema.parse(req.body);
    const canceledOrder = yield productOrder_service_1.productOrderService.cancelOrder(orderId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم رفض الطلب بنجاح',
        data: canceledOrder
    });
});
exports.cancelOrder = cancelOrder;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = validation_1.confirmOrderSchema.parse(req.body);
    const upadtedOrder = yield productOrder_service_1.productOrderService.updateOrderStatus(orderId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: upadtedOrder
    });
});
exports.updateOrderStatus = updateOrderStatus;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderCode } = validation_1.orderParamsSchema.parse(req.params);
    const order = yield productOrder_service_1.productOrderService.getOrder(orderCode);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: order
    });
});
exports.getOrder = getOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, size } = validation_1.paginationSchema.parse(req.query);
    const data = validation_1.getAllOrdersSchema.parse(req.query);
    const orders = yield productOrder_service_1.productOrderService.getAllOrders(Object.assign(Object.assign({}, data), { page, size }));
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع الطلب بنجاح',
        data: orders
    });
});
exports.getAllOrders = getAllOrders;
