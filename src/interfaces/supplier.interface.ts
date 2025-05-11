import { ICloudinaryIMage } from "./cloudinary.interface";
import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface ISupplierModel extends IUserModel {
    businessLicense: {
        file: ICloudinaryIMage,   
        number: string,
    },
    ratings: number
}

export interface ISupplier extends ISupplierModel {}

export interface ICreateSupplierQuery extends ICreateUserQuery {}