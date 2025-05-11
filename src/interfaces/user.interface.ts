import { UserRolesEnum, UserStatusEnum } from "../enums";
import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";

export interface IUserModel extends IDBModel {
    name: string;
    email: string;
    phone: string;
    role: UserRolesEnum,
    avatar?: any,
    password?: string,
    isVerified: boolean,
    status: UserStatusEnum,
    rejectionReason?: string,
}

export interface IUser extends IUserModel {}

export interface ICreateUserQuery {
    name: string;
    email: string;
    phone: string;
    avatar?: any,
    password: string,
}
