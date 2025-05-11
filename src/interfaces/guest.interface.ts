import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface IGuestModel extends IUserModel {}

export interface IGuest extends IGuestModel {}

export interface ICreateGuestQuery extends ICreateUserQuery {}