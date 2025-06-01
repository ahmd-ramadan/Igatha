import { OrderStatus } from "../enums";
import { IAddress } from "./address.interface";
import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { IKitchen } from "./kitchen.interface";

export interface IProductOrderModel extends IDBModel {
    kitchenId: string;
    orderItems: IProductOrderItem[];
    shippingAddressId: string;
    status: OrderStatus;
    subtotalPrice: number;
    shippingPrice: number;
    discount?: number; 
    totalPrice: number;
    orderCode: string;
    paymentId: string;
    timeline: IOrderTimeline[];
}

export interface IProductOrderItem {
    productId: string;
    supplierId: string;
    price: number;
    quantity: number;
    image: ICloudinaryIMage;
    slug: string;
    title: string;
    note: string;
}

export interface IOrderTimeline {
    status: OrderStatus;
    occuredAt: Date;
}

export interface IProductOrder extends IProductOrderModel {
    kitchenData: IKitchen;
    shippingAddressData: IAddress;
    // paymentData: IPayment;
}

export interface ICreateProductOrderQuery {
    shippingAddressId: string;
    kitchenId: string;
    // paymentId: string;
}

export interface ICreateProductOrderData extends ICreateProductOrderQuery {
    orderItems: IProductOrderItem[];
    subtotalPrice: number;
    shippingPrice: number;
    discount?: number;
    totalPrice: number;
    orderCode: string;
    timeline: IOrderTimeline[];
}