import { RequiredMediaAsset } from "../types";
import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface ICharityModel extends IUserModel {
    workPermit: RequiredMediaAsset,
    address: string,
    donations: number,
}

export interface ICharity extends ICharityModel {}

export interface ICreateCharityQuery extends ICreateUserQuery {
    address: string,
}

export interface ICreateCharityData extends ICreateCharityQuery {
    workPermit: RequiredMediaAsset,
}