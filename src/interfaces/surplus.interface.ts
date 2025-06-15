import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { IUser } from "./user.interface";

export interface ISurplusModel extends IDBModel {
    userId: string;
    title: string;
    description: string;
    images: ICloudinaryIMage[];
    isActive: boolean;
    adminNotes: string
}

export interface ISurplus extends ISurplusModel {
    userData: IUser;
}

export interface ICreateSurplusQuery {
    title: string;
    description: string;
}

export interface IUpdateSurplusQuery {
    description?: string;
    title?: string;
    updatedImagesIds?: string[];
    deletedImagesIds?: string[];
}

export interface ICreateSurplusData extends ICreateSurplusQuery {
    userId: string,
    isActive: boolean
}