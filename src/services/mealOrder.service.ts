import { FilterQuery } from "mongoose";
import { OrderStatus } from "../enums";
import { ICreateMealOrderData, ICreateMealOrderQuery, IMeal, IMealOrder, IMealOrderItem } from "../interfaces";
import { mealOrderRepository } from "../repositories";
import { ApiError, BAD_REQUEST, CONFLICT, generateUniqueString, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { addressService } from "./address.service";
import { mealService } from "./meal.service";
import { mealCartService } from "./mealCart.service";

class MealOrderService {

    private readonly populatedArray = [ 'kitchenData', 'shippingAddressData', 'campaignData'];

    constructor(private readonly orderDataSource = mealOrderRepository) {}

    async findOrderByCode(orderCode: string) {
        return await this.orderDataSource.findOneWithPopulate({ orderCode }, this.populatedArray);
    }

    async findOrderById(orderId: string) {
        return await this.orderDataSource.findByIdWithPopulate(orderId, this.populatedArray);
    }

    async findOrder(query: any) {
        return await this.orderDataSource.findOneWithPopulate(query, this.populatedArray);
    }

    async createOrder({ campaignId, data }: { campaignId: string, data: ICreateMealOrderQuery }) {
        try {
            const { kitchenId, shippingAddressId } = data
            
            const orderItems: IMealOrderItem[] = [];
            let subtotalPrice = 0;

            // check cart meals is avalible & make operation on its
            const userCart = await mealCartService.isMealCartExists(campaignId);
            const kitchenMeals = userCart.meals.filter(m => m.kitchenId.toString() === kitchenId.toString());
            
            if(kitchenMeals.length <= 0) {
                throw new ApiError('ليس لديك اي منتجات من  مركز الإعاشة هذا في السلة', CONFLICT)
            }
            for (const { mealId, quantity, note } of kitchenMeals) {
                const meal = await mealCartService.isMealAvailble({ mealId, quantity });
                const { appliedPrice, minimumOrderQuantity, title } = meal;
                if (quantity < minimumOrderQuantity) {
                    throw new ApiError(`الكمية المطلوبة أقل من الكمية الأدني للطلب ${minimumOrderQuantity} للمنتج ${title}`, BAD_REQUEST);
                }
                const orderMeal = this.makeOrderItemsObject({ meal, quantity, note });
                orderItems.push(orderMeal);
                subtotalPrice += quantity * appliedPrice;
            }
            

            //! check coupon discount
            // let couponDetails: IOrderCoupon = {} as IOrderCoupon;
            // if (couponCode) {
            //     couponDetails = await this.makeOrderCouponObject({
            //         totalPurchase: subtotalPrice,
            //         userId,
            //         meals: orderItems,
            //         couponCode
            //     });
            // }

            //! check shippingAddressId is exist
            const shippingAddress = await addressService.isAddressExist(shippingAddressId);
            const shippingPrice = 0 // Update Based on Shipping model;
            
            const orderCode = await this.makeOrderCode();
            const totalPrice = subtotalPrice + shippingPrice;

            //! save order
            const orderMealObject: ICreateMealOrderData = {
                shippingAddressId,
                kitchenId,
                campaignId,
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
            //     orderMealObject.coupon = couponDetails
            // }

            const createdOrder = await this.orderDataSource.createOne(orderMealObject, this.populatedArray);

            if (!createdOrder) {
                throw new ApiError('فشلت عملية إنشاء الطلب', INTERNAL_SERVER_ERROR)
            }

            //! decrease meal stock & increase saleCounter & delete cart meals for one kitchen
            for (const { mealId, quantity } of userCart.meals) {
                let meal = await mealService.isMealExist(mealId);
                const updatedMealData = { 
                    stock: meal.stock - quantity, 
                    saleCounter: meal.saleCounter + quantity 
                };

                await mealService.updateOne({ query: { slug: meal.slug, _id: meal._id }, data: updatedMealData });
            }
            await mealCartService.clearMealsCartForKitchen({ kitchenId, campaignId });
            
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

    private makeOrderItemsObject({ meal, quantity, note }: { meal: IMeal, quantity: number, note?: string }): IMealOrderItem {
        return {
            image: meal?.images[0],
            price: meal.appliedPrice,
            mealId: meal._id,
            slug: meal.slug,
            title: meal.title,
            quantity,
            note: note || ""          
        }
    }
    
    // private async makeOrderCouponObject(
    //     { meals, userId, couponCode, totalPurchase }: 
    //     { meals: IMealOrderItem[], userId: string; couponCode: string, totalPurchase: number }): Promise<IOrderCoupon> {
        
    //     return await couponService.checkCouponDiscount({
    //         couponCode,
    //         meals: meals.map(p => (
    //             {
    //                 mealId: p.mealId,
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

            for (const { mealId, quantity } of isOrderExist.orderItems) {
                let meal = await mealService.isMealExist(mealId);
                const updatedMealData = { 
                    stock: meal.stock + quantity, 
                    saleCounter: meal.saleCounter - quantity 
                };

                await mealService.updateOne({ query: { slug: meal.slug, _id: meal._id }, data: updatedMealData });
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

    async getAllOrders({ kitchenId, campaignId, page, size }: { kitchenId?: string, campaignId?: string, page: number, size: number }) {
        try {
            let query: FilterQuery<IMealOrder> = {};
            if(kitchenId) query.kitchenId = kitchenId;
            if(campaignId) query.campaignId = campaignId;

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

export const mealOrderService = new MealOrderService();