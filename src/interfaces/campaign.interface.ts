import { RequiredMediaAsset } from "../types";
import { ICloudinaryFile, ICloudinaryIMage } from "./cloudinary.interface";
import { ICreateUserQuery, IUserModel } from "./user.interface";

export interface ICampaginModel extends IUserModel {
  pilgrimsCount: number,
  country: string,
  commercialRegister?: RequiredMediaAsset,
  hajjReference: RequiredMediaAsset
}

export interface ICampaign extends ICampaginModel {}

export interface ICreateCampaignQuery extends ICreateUserQuery {
  pilgrimsCount: number,
  country: string,
}

export interface ICreateCampaignData extends ICreateCampaignQuery {
  commercialRegister: RequiredMediaAsset,
  hajjReference: RequiredMediaAsset
}