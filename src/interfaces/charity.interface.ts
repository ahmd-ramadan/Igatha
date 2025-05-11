import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface ICharityModel extends IUserModel {
    organizationName: string,
}

export interface ICharity extends ICharityModel {}

export interface ICreateCharityQuery extends ICreateUserQuery {
    organizationName: string,
}