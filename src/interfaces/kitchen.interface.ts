import { RequiredMediaAsset } from "../types";
import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface IKitchenModel extends IUserModel {
    commercialRegister: RequiredMediaAsset,
    workPermit: RequiredMediaAsset,
    address: string,
    rating: number,
    sales: number,
    totalBalance: number,
    currentBalance: number,
}

export interface IKitchen extends IKitchenModel {}

export interface ICreateKitchenQuery extends ICreateUserQuery {
    address: string,
}

export interface ICreateKitchenData extends ICreateKitchenQuery {
    commercialRegister: RequiredMediaAsset,
    workPermit: RequiredMediaAsset,
}