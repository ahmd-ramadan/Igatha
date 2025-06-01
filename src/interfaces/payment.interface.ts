import { OrderTypes, PaymentMethod, PaymentStatus } from "../enums";
import { IDBModel } from "./database.interface";
import { IProductOrder } from "./productOrder.interface";
import { IUser } from "./user.interface";

export interface IPaymentModel extends IDBModel {
    fromUser: string;
    toUser: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    orderType: OrderTypes;
    orderId: string;
}

export interface IPayment extends IPaymentModel {
    orderData: IProductOrder; // | IMealOrder;
    fromUserData: IUser;
    toUserData: IUser;
}


export interface ICreatePaymentQuery {
    fromUser: string;
    toUser: string;
    amount: number;
    paymentMethod: PaymentMethod;
    orderType: OrderTypes;
    orderId: string;
}