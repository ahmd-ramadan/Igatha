import { OrderStatus } from "../enums";
import { IAddress } from "./address.interface";
import { ICampaign } from "./campaign.interface";
import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { IKitchen } from "./kitchen.interface";

export interface IMealOrderModel extends IDBModel {
    kitchenId: string;
    campaignId: string;
    orderItems: IMealOrderItem[];
    shippingAddressId: string;
    status: OrderStatus;
    subtotalPrice: number;
    shippingPrice: number;
    discount?: number; 
    totalPrice: number;
    orderCode: string;
    paymentId: string;
    timeline: IMealOrderTimeline[];
}

export interface IMealOrderItem {
    mealId: string;
    price: number;
    quantity: number;
    image: ICloudinaryIMage;
    slug: string;
    title: string;
    note: string;
}

export interface IMealOrderTimeline {
    status: OrderStatus;
    occuredAt: Date;
}

export interface IMealOrder extends IMealOrderModel {
    kitchenData: IKitchen;
    campaignData: ICampaign;
    shippingAddressData: IAddress;
    // paymentData: IPayment;
}

export interface ICreateMealOrderQuery {
    shippingAddressId: string;
    kitchenId: string;
    // paymentId: string;
}

export interface ICreateMealOrderData extends ICreateMealOrderQuery {
    campaignId: string,
    orderItems: IMealOrderItem[];
    subtotalPrice: number;
    shippingPrice: number;
    discount?: number;
    totalPrice: number;
    orderCode: string;
    timeline: IMealOrderTimeline[];
}