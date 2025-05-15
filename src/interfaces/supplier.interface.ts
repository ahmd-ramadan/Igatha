import { RequiredMediaAsset } from "../types";
import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface ISupplierModel extends IUserModel {
    commercialRegister?: RequiredMediaAsset,
    workPermit: RequiredMediaAsset,
    address: string,
    rating: number,
    sales: number,
    totalBalance: number,
    currentBalance: number,
}

export interface ISupplier extends ISupplierModel {}

export interface ICreateSupplierQuery extends ICreateUserQuery {
    address: string,
}

export interface ICreateSupplierData extends ICreateSupplierQuery {
    commercialRegister: RequiredMediaAsset,
    workPermit: RequiredMediaAsset
}