import { IDBModel } from "./database.interface";
import { RequestStatusEnum, RequestTypeEnum, UserRolesEnum, UserStatusEnum } from "../enums";

export interface IRequestModel extends IDBModel {
    userId: string;
    role: UserRolesEnum;
    currentData?: any; 
    requestedData: any; 
    status: RequestStatusEnum;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    type: RequestTypeEnum
}

export interface IRequest extends IRequestModel {}

export interface ICreateRequestQuery {
    userId: string;
    role: UserRolesEnum;
    currentData?: any;
    requestedData: any;
    type: RequestTypeEnum
}