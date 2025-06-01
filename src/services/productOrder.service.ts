import { OrderStatus } from "../enums";
import { ICreateProductOrderData, ICreateProductOrderQuery, IProduct, IProductOrderItem, IProductOrderModel } from "../interfaces";
import { productOrderRepository } from "../repositories";
import { ApiError, BAD_REQUEST, CONFLICT, generateUniqueString, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { addressService } from "./address.service";
import { productService } from "./product.service";
import { productCartService } from "./productCart.service";
import { productSubOrderService } from "./productSubOrder.service";

class ProductOrderService {

    private readonly populatedArray = [ 'kitchenData', 'shippingAddressData', 'suppliersData'];

    constructor(private readonly orderDataSource = productOrderRepository) {}

    async findOrderByCode(orderCode: string) {
        return await this.orderDataSource.findOneWithPopulate({ orderCode }, this.populatedArray);
    }

    async findOrderById(orderId: string) {
        return await this.orderDataSource.findByIdWithPopulate(orderId, this.populatedArray);
    }

    async findOrder(query: any) {
        return await this.orderDataSource.findOneWithPopulate(query, this.populatedArray);
    }

    async createOrder(data: ICreateProductOrderQuery) {
        try {
            const { kitchenId, shippingAddressId } = data
            
            const orderItems: IProductOrderItem[] = [];
            let subtotalPrice = 0;

            // check cart products is avalible & make operation on its
            const userCart = await productCartService.isProductCartExists(kitchenId);
            for (const { productId, quantity, note } of userCart.products) {
                const product = await productCartService.isProductAvailble({ productId, quantity });
                const { appliedPrice, minimumOrderQuantity, title } = product;
                if (quantity < minimumOrderQuantity) {
                    throw new ApiError(`الكمية المطلوبة أقل من الكمية الأدني للطلب ${minimumOrderQuantity} للمنتج ${title}`, BAD_REQUEST);
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
            const shippingAddress = await addressService.isAddressExist(shippingAddressId);
            const shippingPrice = 0 // Update Based on Shipping model;
            
            const orderCode = await this.makeOrderCode();
            const totalPrice = subtotalPrice + shippingPrice;

            //! save order
            const orderProductObject: ICreateProductOrderData = {
                shippingAddressId,
                kitchenId,
                orderCode,
                orderItems,
                shippingPrice,
                subtotalPrice,
                totalPrice,
                timeline: [
                    {
                        status: OrderStatus.PENDING,
                        occuredAt: new Date()
                    }
                ],
            }
            // if (couponCode && couponDetails && couponDetails?.code) {
            //     orderProductObject.coupon = couponDetails
            // }

            const createdOrder = await this.orderDataSource.createOne(orderProductObject, this.populatedArray);

            if (!createdOrder) {
                throw new ApiError('فشلت عملية إنشاء الطلب', INTERNAL_SERVER_ERROR)
            }

            //! Make SubOrders To Suppliers
            const isOk = await productSubOrderService.createSubOrdersFromOrders(createdOrder); 
            if (!isOk) {
                throw new ApiError('فشل في إرسال الطلب للمورين', CONFLICT)
            }

            //! decrease product stock & increase saleCounter & delete cart products
            for (const { productId, quantity } of userCart.products) {
                let product = await productService.isProductExist(productId);
                const updatedProductData = { 
                    stock: product.stock - quantity, 
                    saleCounter: product.saleCounter + quantity 
                };

                await productService.updateOne({ query: { slug: product.slug, _id: product._id }, data: updatedProductData });
            }
            await productCartService.clearProductsCart(kitchenId);
            
            //! increasw used of coupon
            // if (couponCode) {
            //     const { usedCount } = await couponService.findCouponByCode(couponCode) as ICouponModel; 
            //     await couponService.updateCouponByCode({ couponCode, data: { usedCount: usedCount - 1 }})
            // }

            //! create invoice
            // const invoice = await invoiceService.makeInvoice({ order: createdOrder as IOrder, shippingAddress })

            //! send response
            return createdOrder;

        } catch(error) {
            console.log(error)
            if (error instanceof ApiError) {
                throw error;
            }
            console.log(error);
            throw new ApiError('فشل عملية إنشاء الطلب', INTERNAL_SERVER_ERROR);
        }
    }

    private makeOrderItemsObject({ product, quantity, note }: { product: IProduct, quantity: number, note?: string }): IProductOrderItem {
        return {
            image: product?.images[0],
            price: product.appliedPrice,
            productId: product._id,
            slug: product.slug,
            title: product.title,
            quantity,
            supplierId: product.supplierId,
            note: note || ""          
        }
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

    private async makeOrderCode(): Promise<string> {
        let orderCode = "";
        do {
            orderCode = generateUniqueString({ length: 6, type: 'numbers' });
            const isOrderExist = await this.findOrderByCode(orderCode);
            if (!isOrderExist) break;
        } while(true);
        return orderCode;
    }

    async isOrderExist({ orderId, orderCode  }: { orderId?: string, orderCode?: string }) {
        let isOrderExist = null;
        if (orderId) isOrderExist = await this.findOrderById(orderId);
        if (orderCode) isOrderExist = await this.findOrderByCode(orderCode); 

        if (!isOrderExist) {
            throw new ApiError('هذا الطلب غير موجود', NOT_FOUND);
        }
        return isOrderExist;
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

    async cancelOrder(orderId: string) {
        try {
            const isOrderExist = await this.isOrderExist({ orderId });
            const timeline = isOrderExist.timeline;
            
            // const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
            // if (isOrderConfirmed) {
            //     throw new ApiError('تم تأكيد الطلب بالفعل لا يمكن إلغاؤه', CONFLICT)
            // }
            const isOrderCanceled = timeline.some(t => t.status === OrderStatus.CANCELLED);
            if (isOrderCanceled) {
                throw new ApiError('تم إلغاء الطلب بالفعل', CONFLICT)
            }
            const isOrderNotPending = timeline.some(t => t.status === OrderStatus.SHIPPED || t.status === OrderStatus.DELIVERED);
            if (isOrderNotPending) {
                throw new ApiError('تم إلغاء الطلب بالفعل', CONFLICT)
            }
            timeline.push({
                status: OrderStatus.CANCELLED,
                occuredAt: new Date()
            })

            for (const { productId, quantity } of isOrderExist.orderItems) {
                let product = await productService.isProductExist(productId);
                const updatedProductData = { 
                    stock: product.stock + quantity, 
                    saleCounter: product.saleCounter - quantity 
                };

                await productService.updateOne({ query: { slug: product.slug, _id: product._id }, data: updatedProductData });
            }

            return await this.orderDataSource.updateOne({ _id: orderId }, { timeline });

            //! Send notification or email for canceled
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('فشل عملية رفض الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async updateOrderStatus(orderId: string) {
        try {
            const isOrderExist = await this.isOrderExist({ orderId });
            const timeline = isOrderExist.timeline;

            const isOrderCanceled = timeline.some(t => t.status === OrderStatus.CANCELLED);
            if (isOrderCanceled) {
                throw new ApiError('تم رفض الطلب بالفعل لا يمكن إجراء أي تغييرات', CONFLICT)
            }
            // const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
            // if (!isOrderConfirmed) {
            //     throw new ApiError('يجب أن يتم تأكيد الطلب أولا', CONFLICT)
            // }
            const isOrderDelivered = timeline.some(t => t.status === OrderStatus.DELIVERED);
            if (isOrderDelivered) {
                throw new ApiError('تم توصيل الاوردر .. لايوجد اي تحديث أخر', CONFLICT)
            }

            let newStatus: OrderStatus = OrderStatus.SHIPPED;
            if (timeline.at(-1)?.status === newStatus) newStatus = OrderStatus.DELIVERED;

            timeline.push({
                status: newStatus,
                occuredAt: new Date()
            })

            return await this.orderDataSource.updateOne({ _id: orderId }, { timeline });

            //! Send notification or email for updated status ?
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('فشل عملية تحديث حالة الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async getOrder(orderCode: string) {
        try {
            const order = await this.isOrderExist({ orderCode });
            return order;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('فشل في إرجاع الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async getAllOrders({ kitchenId, page, size }: { kitchenId?: string, page: number, size: number }) {
        try {
            let query: any = {};
            if(kitchenId) query.userId = kitchenId;

            const { limit, skip } = pagination({ page, size });

            return await this.orderDataSource.findWithPopulate(query, this.populatedArray, { skip, limit, sort: { createdAt: -1 } });
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('فشل في إرجاع الطلبات', INTERNAL_SERVER_ERROR)
        }
    }

    async findMany(query: any) {
        try {
            return await this.orderDataSource.findWithPopulate(query, this.populatedArray);
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('فشل في إرجاع الطلبات', INTERNAL_SERVER_ERROR)
        }
    }
}

export const productOrderService = new ProductOrderService();