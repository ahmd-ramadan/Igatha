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
exports.productSubOrderService = void 0;
const repositories_1 = require("../repositories");
const enums_1 = require("../enums");
const utils_1 = require("../utils");
const productOrder_service_1 = require("./productOrder.service");
class ProductSubOrderService {
    constructor(orderDataSource = repositories_1.productSubOrderRepository) {
        this.orderDataSource = orderDataSource;
        this.populatedArray = ['supplierData', 'orderData'];
    }
    findOrder(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderDataSource.findOneWithPopulate(query, this.populatedArray);
            if (!order) {
                throw new utils_1.ApiError('الطلب غير موجود', utils_1.NOT_FOUND);
            }
            return order;
        });
    }
    findOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderDataSource.findByIdWithPopulate(orderId, this.populatedArray);
            if (!order) {
                throw new utils_1.ApiError('الطلب غير موجود', utils_1.NOT_FOUND);
            }
            return order;
        });
    }
    createSubOrdersFromOrders(order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kitchenId, orderItems, _id: orderId } = order;
                // Divide orders to suborders
                const ordersMap = new Map();
                for (const product of orderItems) {
                    const subOrderItem = {
                        productId: product.productId,
                        price: product.price,
                        quantity: product.quantity,
                        image: product.image,
                        slug: product.slug,
                        title: product.title,
                        note: product.note
                    };
                    const supplierId = product.supplierId.toString();
                    if (ordersMap.has(supplierId)) {
                        let supplierOrders = ordersMap.get(supplierId);
                        supplierOrders === null || supplierOrders === void 0 ? void 0 : supplierOrders.push(subOrderItem);
                        ordersMap.set(supplierId, supplierOrders || []);
                    }
                    else {
                        ordersMap.set(supplierId, [subOrderItem]);
                    }
                }
                console.log(ordersMap);
                for (const [supplierId, supplierOrders] of ordersMap.entries()) {
                    const subOrder = yield this.orderDataSource.createOne({
                        orderId,
                        kitchenId,
                        supplierId,
                        orderItems: supplierOrders,
                        status: enums_1.OrderStatus.PENDING,
                        totalPrice: supplierOrders.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                    }, this.populatedArray);
                    if (!subOrder) {
                        throw new utils_1.ApiError('فشلت عملية إنشاء الطلب الفرعي', utils_1.INTERNAL_SERVER_ERROR);
                    }
                    //! Send email/notification for supplier
                }
                console.log(ordersMap);
                return true;
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('فشل عملية إرسال الطلب للموردين', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getSupplierOrders(_a) {
        return __awaiter(this, arguments, void 0, function* ({ supplierId, page, size }) {
            try {
                const { skip, limit } = (0, utils_1.pagination)({ page, size });
                const orders = yield this.orderDataSource.findWithPopulate({ supplierId }, this.populatedArray, { skip, limit, sort: { createdAt: -1 } });
                return orders;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('فشل عملية إرجاع طلبات المورد', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllSubOrders(_a) {
        return __awaiter(this, arguments, void 0, function* ({ supplierId, page, size, date, status }) {
            try {
                const query = {};
                if (date)
                    query.createdAt = { $gt: date };
                if (status)
                    query.status = status;
                if (supplierId)
                    query.supplierId = supplierId;
                const { skip, limit } = (0, utils_1.pagination)({ page, size });
                const orders = yield this.orderDataSource.findWithPopulate(query, this.populatedArray, { skip, limit, sort: { createdAt: -1 } });
                return orders;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('فشل عملية إرجاع طلبات المورد', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getSupplierOrderByCode(_a) {
        return __awaiter(this, arguments, void 0, function* ({ orderCode, supplierId }) {
            const generalOrder = yield productOrder_service_1.productOrderService.findOrder({ orderCode });
            const supplierOrder = yield this.getSupplierOrderById({ orderId: generalOrder._id, supplierId });
            return supplierOrder;
        });
    }
    getSupplierOrderById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ orderId, supplierId }) {
            const supplierOrder = yield this.orderDataSource.findOneWithPopulate({ orderId, supplierId }, this.populatedArray);
            return supplierOrder;
        });
    }
    updateOrderStatus(_a) {
        return __awaiter(this, arguments, void 0, function* ({ orderId, supplierId }) {
            try {
                const { status, supplierId: orderSupplierId } = yield this.findOrder({ orderId });
                if (supplierId.toString() !== orderSupplierId.toString()) {
                    throw new utils_1.ApiError('أنت لست صاحب الاوردر لا يمكنك تحديثه', utils_1.CONFLICT);
                }
                if (status === enums_1.OrderStatus.CANCELLED) {
                    throw new utils_1.ApiError('تم رفض الطلب بالفعل لا يمكن إجراء أي تغييرات', utils_1.CONFLICT);
                }
                // const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
                // if (!isOrderConfirmed) {
                //     throw new ApiError('يجب أن يتم تأكيد الطلب أولا', CONFLICT)
                // }
                if (status == enums_1.OrderStatus.DELIVERED) {
                    throw new utils_1.ApiError('تم توصيل الاوردر .. لايوجد اي تحديث أخر', utils_1.CONFLICT);
                }
                let newStatus = enums_1.OrderStatus.SHIPPED;
                if (status === newStatus)
                    newStatus = enums_1.OrderStatus.DELIVERED;
                const updatedOrder = yield this.orderDataSource.updateOne({ orderId, supplierId }, { status: newStatus });
                // update parentOrder Or cancel timeline !! maybe
                //! Send notification or email for updated status ?
                return updatedOrder;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية تحديث حالة الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.productSubOrderService = new ProductSubOrderService();
