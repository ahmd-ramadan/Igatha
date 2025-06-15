import { IAddress } from "./address.interface";
import { ICharity } from "./charity.interface";
import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { IUser } from "./user.interface";

export interface ISurplusOrderModel extends IDBModel {
    userId: string;
    charityId: string;
    title: string;
    description: string;
    images: ICloudinaryIMage[];
    shippingAddressId: string;
    status: SurplusOrderStatus;
    orderCode: string;
    timeline: ISurplusOrderTimeline[];
}

export interface ISurplusOrderTimeline {
    status: SurplusOrderStatus;
    occuredAt: Date;
}

export interface ISurplusOrder extends ISurplusOrderModel {
    userData: IUser;
    charityData: ICharity;
    shippingAddressData: IAddress;
}

export enum SurplusOrderStatus {
    PENDING = 'pending',
    SHIPPED = "shipped",
    DELIVERED = "delivered"
}

export interface ICreateSurplusOrderQuery {
    shippingAddressId: string;
    surplusId: string;
}

export interface ICreateSurplusOrderData extends Omit<ICreateSurplusOrderQuery, 'surplusId'> {
    charityId: string,
    userId: string;
    title: string;
    description: string;
    images: ICloudinaryIMage[];
    status: SurplusOrderStatus;
    orderCode: string;
    timeline: ISurplusOrderTimeline[];
}