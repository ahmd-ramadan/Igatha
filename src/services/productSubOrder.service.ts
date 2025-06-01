import { FilterQuery } from "mongoose";
import { productSubOrderRepository } from "../repositories";
import { IProductOrder, IProductOrderModel, IProductSubOrder, IProductSubOrderItem, IProductSubOrderModel } from "../interfaces";
import { OrderStatus } from "../enums";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { productOrderService } from "./productOrder.service";

class ProductSubOrderService {

    private readonly populatedArray = ['supplierData', 'orderData'];

    constructor(private readonly orderDataSource = productSubOrderRepository) {}

    async findOrder(query: FilterQuery<IProductSubOrder>) {
        const order =  await this.orderDataSource.findOneWithPopulate(query, this.populatedArray);
        if (!order) {
            throw new ApiError('الطلب غير موجود', NOT_FOUND)
        }
        return order;
    }

    async findOrderById(orderId: string) {
        const order = await this.orderDataSource.findByIdWithPopulate(orderId, this.populatedArray);
        if (!order) {
            throw new ApiError('الطلب غير موجود', NOT_FOUND)
        }
        return order;
    }

    async createSubOrdersFromOrders(order: IProductOrder | IProductOrderModel) {
        try {
            const {
                kitchenId,
                orderItems,
                _id: orderId
            } = order;

            // Divide orders to suborders
            const ordersMap = new Map<string, IProductSubOrderItem[]>();
            for(const product of orderItems) {
                const subOrderItem: IProductSubOrderItem = {
                    productId: product.productId,
                    price: product.price,
                    quantity: product.quantity,
                    image: product.image,
                    slug: product.slug,
                    title: product.title,
                    note: product.note
                };
                
                const supplierId = product.supplierId.toString();
                if(ordersMap.has(supplierId)) {
                    let supplierOrders = ordersMap.get(supplierId);
                    supplierOrders?.push(subOrderItem)
                    ordersMap.set(supplierId, supplierOrders || []);
                } else {
                    ordersMap.set(supplierId, [ subOrderItem ]);
                }
            }

            console.log(ordersMap)

            for(const [supplierId, supplierOrders] of ordersMap.entries()) {
                const subOrder = await this.orderDataSource.createOne({
                    orderId,
                    kitchenId,
                    supplierId,
                    orderItems: supplierOrders,
                    status: OrderStatus.PENDING,
                    totalPrice: supplierOrders.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                } as IProductSubOrderModel, this.populatedArray);

                if (!subOrder) {
                    throw new ApiError('فشلت عملية إنشاء الطلب الفرعي', INTERNAL_SERVER_ERROR);
                }

                //! Send email/notification for supplier
            } 
            console.log(ordersMap)
            return true;
        } catch(error) {
            console.log(error)
            if(error instanceof ApiError) throw error;
            throw new ApiError('فشل عملية إرسال الطلب للموردين', INTERNAL_SERVER_ERROR)
        }
    }

    async getSupplierOrders({ supplierId, page, size }: { supplierId: string, page: number, size: number }) {
        try {   
            const { skip, limit } = pagination({ page, size });
            const orders = await this.orderDataSource.findWithPopulate({ supplierId }, this.populatedArray, { skip, limit, sort: { createdAt: -1 }}); 
            return orders;
        } catch(error) {
            if(error instanceof ApiError) throw error;
            throw new ApiError('فشل عملية إرجاع طلبات المورد', INTERNAL_SERVER_ERROR)
        }
    }
    async getAllSubOrders({ supplierId, page, size, date, status }: { supplierId?: string, page: number, size: number, date?: Date, status?: OrderStatus }) {
        try {   
            const query: any = {}
            if (date) query.createdAt = { $gt: date }
            if (status) query.status = status;
            if (supplierId) query.supplierId = supplierId;
            
            const { skip, limit } = pagination({ page, size });
            
            const orders = await this.orderDataSource.findWithPopulate(query, this.populatedArray, { skip, limit, sort: { createdAt: -1 }}); 
            return orders;
        } catch(error) {
            if(error instanceof ApiError) throw error;
            throw new ApiError('فشل عملية إرجاع طلبات المورد', INTERNAL_SERVER_ERROR)
        }
    }

    async getSupplierOrderByCode({ orderCode, supplierId }: { orderCode: string, supplierId: string }) {
        const generalOrder = await productOrderService.findOrder({ orderCode }) as IProductOrder;
        const supplierOrder = await this.getSupplierOrderById({ orderId: generalOrder._id, supplierId });
        return supplierOrder;
    }
    async getSupplierOrderById({ orderId, supplierId }: { orderId: string, supplierId: string }) {
        const supplierOrder = await this.orderDataSource.findOneWithPopulate({ orderId, supplierId }, this.populatedArray);
        return supplierOrder;
    }

    async updateOrderStatus({ orderId, supplierId }: { orderId: string, supplierId: string }) {
        try {
            const { status, supplierId: orderSupplierId } = await this.findOrder({ orderId });
 
            if(supplierId.toString() !== orderSupplierId.toString()) {
                throw new ApiError('أنت لست صاحب الاوردر لا يمكنك تحديثه', CONFLICT)
            }

            if (status === OrderStatus.CANCELLED) {
                throw new ApiError('تم رفض الطلب بالفعل لا يمكن إجراء أي تغييرات', CONFLICT)
            }
            // const isOrderConfirmed = timeline.some(t => t.status === OrderStatus.CONFIRMED);
            // if (!isOrderConfirmed) {
            //     throw new ApiError('يجب أن يتم تأكيد الطلب أولا', CONFLICT)
            // }
            if (status == OrderStatus.DELIVERED) {
                throw new ApiError('تم توصيل الاوردر .. لايوجد اي تحديث أخر', CONFLICT)
            }

            let newStatus: OrderStatus = OrderStatus.SHIPPED;
            if (status === newStatus) newStatus = OrderStatus.DELIVERED;

            const updatedOrder = await this.orderDataSource.updateOne({ orderId, supplierId }, { status: newStatus });
            
            // update parentOrder Or cancel timeline !! maybe
            
            //! Send notification or email for updated status ?

            return updatedOrder;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('فشل عملية تحديث حالة الطلب', INTERNAL_SERVER_ERROR)
        }
    } 
}

export const productSubOrderService = new ProductSubOrderService();