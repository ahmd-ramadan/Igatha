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
exports.productOrderService = void 0;
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const address_service_1 = require("./address.service");
const product_service_1 = require("./product.service");
const productCart_service_1 = require("./productCart.service");
const productSubOrder_service_1 = require("./productSubOrder.service");
class ProductOrderService {
    constructor(orderDataSource = repositories_1.productOrderRepository) {
        this.orderDataSource = orderDataSource;
        this.populatedArray = ['kitchenData', 'shippingAddressData', 'suppliersData'];
    }
    findOrderByCode(orderCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderDataSource.findOneWithPopulate({ orderCode }, this.populatedArray);
        });
    }
    findOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderDataSource.findByIdWithPopulate(orderId, this.populatedArray);
        });
    }
    findOrder(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderDataSource.findOneWithPopulate(query, this.populatedArray);
        });
    }
    createOrder(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kitchenId, shippingAddressId } = data;
                const orderItems = [];
                let subtotalPrice = 0;
                // check cart products is avalible & make operation on its
                const userCart = yield productCart_service_1.productCartService.isProductCartExists(kitchenId);
                for (const { productId, quantity, note } of userCart.products) {
                    const product = yield productCart_service_1.productCartService.isProductAvailble({ productId, quantity });
                    const { appliedPrice, minimumOrderQuantity, title } = product;
                    if (quantity < minimumOrderQuantity) {
                        throw new utils_1.ApiError(`الكمية المطلوبة أقل من الكمية الأدني للطلب ${minimumOrderQuantity} للمنتج ${title}`, utils_1.BAD_REQUEST);
                    }
                    const orderProduct = this.makeOrderItemsObject({ product, quantity, note });
                    orderItems.push(orderProduct);
                    subtotalPrice += quantity * appliedPrice;
                }
                //! check coupon discount
                // let couponDetails: IOrderCoupon = {} as IOrderCoupon;
                // if (couponCode) {
                //     couponDetails = await this.makeOrderCouponObject({
                //         totalPurchase: subtotalPrice,
                //         userId,
                //         products: orderItems,
                //         couponCode
                //     });
                // }
                //! check shippingAddressId is exist
                const shippingAddress = yield address_service_1.addressService.isAddressExist(shippingAddressId);
                const shippingPrice = 0; // Update Based on Shipping model;
                const orderCode = yield this.makeOrderCode();
                const totalPrice = subtotalPrice + shippingPrice;
                //! save order
                const orderProductObject = {
                    shippingAddressId,
                    kitchenId,
                    orderCode,
                    orderItems,
                    shippingPrice,
                    subtotalPrice,
                    totalPrice,
                    timeline: [
                        {
                            status: enums_1.OrderStatus.PENDING,
                            occuredAt: new Date()
                        }
                    ],
                };
                // if (couponCode && couponDetails && couponDetails?.code) {
                //     orderProductObject.coupon = couponDetails
                // }
                const createdOrder = yield this.orderDataSource.createOne(orderProductObject, this.populatedArray);
                if (!createdOrder) {
                    throw new utils_1.ApiError('فشلت عملية إنشاء الطلب', utils_1.INTERNAL_SERVER_ERROR);
                }
                //! Make SubOrders To Suppliers
                const isOk = yield productSubOrder_service_1.productSubOrderService.createSubOrdersFromOrders(createdOrder);
                if (!isOk) {
                    throw new utils_1.ApiError('فشل في إرسال الطلب للمورين', utils_1.CONFLICT);
                }
                //! decrease product stock & increase saleCounter & delete cart products
                for (const { productId, quantity } of userCart.products) {
                    let product = yield product_service_1.productService.isProductExist(productId);
                    const updatedProductData = {
                        stock: product.stock - quantity,
                        saleCounter: product.saleCounter + quantity
                    };
                    yield product_service_1.productService.updateOne({ query: { slug: product.slug, _id: product._id }, data: updatedProductData });
                }
                yield productCart_service_1.productCartService.clearProductsCart(kitchenId);
                //! increasw used of coupon
                // if (couponCode) {
                //     const { usedCount } = await couponService.findCouponByCode(couponCode) as ICouponModel; 
                //     await couponService.updateCouponByCode({ couponCode, data: { usedCount: usedCount - 1 }})
                // }
                //! create invoice
                // const invoice = await invoiceService.makeInvoice({ order: createdOrder as IOrder, shippingAddress })
                //! send response
                return createdOrder;
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                console.log(error);
                throw new utils_1.ApiError('فشل عملية إنشاء الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    makeOrderItemsObject({ product, quantity, note }) {
        return {
            image: product === null || product === void 0 ? void 0 : product.images[0],
            price: product.appliedPrice,
            productId: product._id,
            slug: product.slug,
            title: product.title,
            quantity,
            supplierId: product.supplierId,
            note: note || ""
        };
    }
    // private async makeOrderCouponObject(
    //     { products, userId, couponCode, totalPurchase }: 
    //     { products: IProductOrderItem[], userId: string; couponCode: string, totalPurchase: number }): Promise<IOrderCoupon> {
    //     return await couponService.checkCouponDiscount({
    //         couponCode,
    //         products: products.map(p => (
    //             {
    //                 productId: p.productId,
    //             }
    //         )),
    //         totalPurchase,
    //         userId
    //     })
    // }
    makeOrderCode() {
        return __awaiter(this, void 0, void 0, function* () {
            let orderCode = "";
            do {
                orderCode = (0, utils_1.generateUniqueString)({ length: 6, type: 'numbers' });
                const isOrderExist = yield this.findOrderByCode(orderCode);
                if (!isOrderExist)
                    break;
            } while (true);
            return orderCode;
        });
    }
    isOrderExist(_a) {
        return __awaiter(this, arguments, void 0, function* ({ orderId, orderCode }) {
            let isOrderExist = null;
            if (orderId)
                isOrderExist = yield this.findOrderById(orderId);
            if (orderCode)
                isOrderExist = yield this.findOrderByCode(orderCode);
            if (!isOrderExist) {
                throw new utils_1.ApiError('هذا الطلب غير موجود', utils_1.NOT_FOUND);
            }
            return isOrderExist;
        });
    }
    // async confirmOrder(orderId: string) {
    //     try {
    //         const isOrderExist = await this.isOrderExist({ orderId });
    //         const timeline = isOrderExist.timeline;
    //         const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
    //         if (isOrderConfirmed) {
    //             throw new ApiError('تم تأكيد الطلب بالفعل', CONFLICT)
    //         }
    //         const isOrderCanceled = timeline.some(t => t.status === OrderStatus.CANCELED);
    //         if (isOrderCanceled) {
    //             throw new ApiError('تم رفض الطلب بالفعل لا يمكن إجراء أي تغييرات', CONFLICT)
    //         }
    //         timeline.push({
    //             status: OrderStatus.CONFIRMED,
    //             occuredAt: new Date()
    //         })
    //         return await this.orderDataSource.updateOne({ _id: orderId }, { timeline });
    //         //! Send notification or email for confirmed
    //     } catch(error) {
    //         if (error instanceof ApiError) {
    //             throw error;
    //         }
    //         throw new ApiError('فشل عملية تأكيد الطلب', INTERNAL_SERVER_ERROR)
    //     }
    // }
    cancelOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isOrderExist = yield this.isOrderExist({ orderId });
                const timeline = isOrderExist.timeline;
                // const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
                // if (isOrderConfirmed) {
                //     throw new ApiError('تم تأكيد الطلب بالفعل لا يمكن إلغاؤه', CONFLICT)
                // }
                const isOrderCanceled = timeline.some(t => t.status === enums_1.OrderStatus.CANCELLED);
                if (isOrderCanceled) {
                    throw new utils_1.ApiError('تم إلغاء الطلب بالفعل', utils_1.CONFLICT);
                }
                const isOrderNotPending = timeline.some(t => t.status === enums_1.OrderStatus.SHIPPED || t.status === enums_1.OrderStatus.DELIVERED);
                if (isOrderNotPending) {
                    throw new utils_1.ApiError('تم إلغاء الطلب بالفعل', utils_1.CONFLICT);
                }
                timeline.push({
                    status: enums_1.OrderStatus.CANCELLED,
                    occuredAt: new Date()
                });
                for (const { productId, quantity } of isOrderExist.orderItems) {
                    let product = yield product_service_1.productService.isProductExist(productId);
                    const updatedProductData = {
                        stock: product.stock + quantity,
                        saleCounter: product.saleCounter - quantity
                    };
                    yield product_service_1.productService.updateOne({ query: { slug: product.slug, _id: product._id }, data: updatedProductData });
                }
                return yield this.orderDataSource.updateOne({ _id: orderId }, { timeline });
                //! Send notification or email for canceled
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية رفض الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateOrderStatus(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const isOrderExist = yield this.isOrderExist({ orderId });
                const timeline = isOrderExist.timeline;
                const isOrderCanceled = timeline.some(t => t.status === enums_1.OrderStatus.CANCELLED);
                if (isOrderCanceled) {
                    throw new utils_1.ApiError('تم رفض الطلب بالفعل لا يمكن إجراء أي تغييرات', utils_1.CONFLICT);
                }
                // const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
                // if (!isOrderConfirmed) {
                //     throw new ApiError('يجب أن يتم تأكيد الطلب أولا', CONFLICT)
                // }
                const isOrderDelivered = timeline.some(t => t.status === enums_1.OrderStatus.DELIVERED);
                if (isOrderDelivered) {
                    throw new utils_1.ApiError('تم توصيل الاوردر .. لايوجد اي تحديث أخر', utils_1.CONFLICT);
                }
                let newStatus = enums_1.OrderStatus.SHIPPED;
                if (((_a = timeline.at(-1)) === null || _a === void 0 ? void 0 : _a.status) === newStatus)
                    newStatus = enums_1.OrderStatus.DELIVERED;
                timeline.push({
                    status: newStatus,
                    occuredAt: new Date()
                });
                return yield this.orderDataSource.updateOne({ _id: orderId }, { timeline });
                //! Send notification or email for updated status ?
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية تحديث حالة الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getOrder(orderCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield this.isOrderExist({ orderCode });
                return order;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل في إرجاع الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllOrders(_a) {
        return __awaiter(this, arguments, void 0, function* ({ kitchenId, page, size }) {
            try {
                let query = {};
                if (kitchenId)
                    query.userId = kitchenId;
                const { limit, skip } = (0, utils_1.pagination)({ page, size });
                return yield this.orderDataSource.findWithPopulate(query, this.populatedArray, { skip, limit, sort: { createdAt: -1 } });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل في إرجاع الطلبات', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    findMany(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.orderDataSource.findWithPopulate(query, this.populatedArray);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل في إرجاع الطلبات', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.productOrderService = new ProductOrderService();
