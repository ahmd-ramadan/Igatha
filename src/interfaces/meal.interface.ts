import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { IKitchen } from "./kitchen.interface";

export interface IMealModel extends IDBModel {
    title: string,
    slug: string,
    desc: string,
    price: number,
    discount: number,
    images: ICloudinaryIMage[],
    stock: number,
    kitchenId: string;
    adminNotes: string;
    isActive: boolean;
    isDeleted: boolean;
    minimumOrderQuantity: number;
    appliedPrice: number;
    saleCounter: number;
}

export interface IMeal extends IMealModel {
    kitchenData: IKitchen;
}

export interface ICreateMealQuery {
    title: string;
    desc: string;
    price: number;
    discount?: number;
    stock: number;
    minimumOrderQuantity: number;
}

export interface IUpdateMealQuery {
    title?: string;
    desc?: string;
    price?: number;
    discount?: number;
    stock?: number;
    minimumOrderQuantity?: number;
    updatedImagesIds?: string[];
    deletedImagesIds?: string[];
}


