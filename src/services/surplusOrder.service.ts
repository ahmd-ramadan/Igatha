import { FilterQuery } from "mongoose";
import { surplusOrderRepository } from "../repositories";
import { ICreateSurplusOrderData, ICreateSurplusOrderQuery, ISurplusModel, ISurplusOrderModel, SurplusOrderStatus } from "../interfaces";
import { addressService } from "./address.service";
import { surplusService } from "./surplus.service";
import { ApiError, CONFLICT, generateUniqueString, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";

class SurplusOrderService {

    private readonly populatedArray = [ 'charityData', 'shippingAddressData', 'userData'];

    constructor(private readonly orderDataSource = surplusOrderRepository) {}

    async findOrderByCode(orderCode: string) {
        return await this.orderDataSource.findOneWithPopulate({ orderCode }, this.populatedArray);
    }

    async findOrderById(orderId: string) {
        return await this.orderDataSource.findByIdWithPopulate(orderId, this.populatedArray);
    }

    async findOrder(query: FilterQuery<ISurplusModel>) {
        return await this.orderDataSource.findOneWithPopulate(query, this.populatedArray);
    }

    async createOrder({ charityId, data }: { charityId: string, data: ICreateSurplusOrderQuery }) {
        try {
            const { shippingAddressId, surplusId } = data

            // find surplus
            const surplus = await surplusService.isSurplusExist(surplusId);

            //! check shippingAddressId is exist
            const shippingAddress = await addressService.isAddressExist(shippingAddressId);

            const orderCode = await this.makeOrderCode();

            //! save order
            const orderSurplusObject: ICreateSurplusOrderData = {
                userId: surplus.userId,
                shippingAddressId,
                charityId,
                orderCode,
                title: surplus.title,
                description: surplus.description,
                images: surplus.images,
                status: SurplusOrderStatus.PENDING,
                timeline: [
                    {
                        status: SurplusOrderStatus.PENDING,
                        occuredAt: new Date()
                    }
                ],
            }

            const createdOrder = await this.orderDataSource.createOne(orderSurplusObject, this.populatedArray);

            if (!createdOrder) {
                throw new ApiError('فشلت عملية إنشاء الطلب', INTERNAL_SERVER_ERROR)
            }

            // Delete the surplus
            await surplusService.deleteSurplus({ surplusId: surplus._id, userId: surplus.userId });

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

    async updateSurplusOrderStatus(orderId: string) {
        try {
            const isOrderExist = await this.isOrderExist({ orderId });
            const timeline = isOrderExist.timeline;

            // const isOrderCanceled = timeline.some(t => t.status === SurplusOrderStatus.CANCELLED);
            // if (isOrderCanceled) {
            //     throw new ApiError('تم رفض الطلب بالفعل لا يمكن إجراء أي تغييرات', CONFLICT)
            // }
            // const isOrderConfirmed = timeline.some(t => t.status === SurplusOrderStatus.CONFIRMED);
            // if (!isOrderConfirmed) {
            //     throw new ApiError('يجب أن يتم تأكيد الطلب أولا', CONFLICT)
            // }
            const isOrderDelivered = timeline.some(t => t.status === SurplusOrderStatus.DELIVERED);
            if (isOrderDelivered) {
                throw new ApiError('تم توصيل الاوردر .. لايوجد اي تحديث أخر', CONFLICT)
            }

            let newStatus: SurplusOrderStatus = SurplusOrderStatus.SHIPPED;
            if (timeline.at(-1)?.status === newStatus) newStatus = SurplusOrderStatus.DELIVERED;

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

    async getAllOrders({ userId, charityId, date, page, size }: { userId?: string, charityId?: string, date?: Date, page: number, size: number }) {
        try {
            let query: FilterQuery<ISurplusOrderModel> = {};
            if(userId) query.userId = userId;
            if(charityId) query.charityId = charityId;
            if(date) query.createdAt = { $gt: date};

            const { limit, skip } = pagination({ page, size });

            console.log(query);

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

export const surplusOrderService = new SurplusOrderService();