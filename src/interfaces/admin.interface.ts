import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface IAdminModel extends IUserModel {}

export interface IAdmin extends IAdminModel {}

export interface ICreateAdminQuery extends ICreateUserQuery {}