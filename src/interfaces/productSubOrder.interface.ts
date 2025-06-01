import { OrderStatus } from "../enums";
import { IAddress } from "./address.interface";
import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { IKitchen } from "./kitchen.interface";
import { IProductOrder } from "./productOrder.interface";
import { ISupplier } from "./supplier.interface";

export interface IProductSubOrderModel extends IDBModel {
    orderId: string;
    kitchenId: string;
    supplierId: string;
    orderItems: IProductSubOrderItem[];
    status: OrderStatus;
    totalPrice: number;
    // timeline: ISubOrderTimeline[];
}

export interface IProductSubOrderItem {
    productId: string;
    price: number;
    quantity: number;
    image: ICloudinaryIMage;
    slug: string;
    title: string;
    note: string;
}

export interface ISubOrderTimeline {
    status: OrderStatus;
    occuredAt: Date;
}

export interface IProductSubOrder extends IProductSubOrderModel {
    kitchenData: IKitchen;
    supplierData: ISupplier;
    orderData: IProductOrder;
    shippingAddressData: IAddress;
    // paymentData: IPayment;
}

export interface ICreateProductSubOrderQuery {
    shippingAddressId: string;
    kitchenId: string;
    supplierId: string;
    // paymentId: string;
}

export interface ICreateProductSubOrderData extends ICreateProductSubOrderQuery {
    orderItems: IProductSubOrderItem[];
    totalPrice: number;
    orderId: string;
    timeline: ISubOrderTimeline[];
}