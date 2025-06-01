import { ICloudinaryIMage } from "./cloudinary.interface";
import { IDBModel } from "./database.interface";
import { ISupplier } from "./supplier.interface";

export interface IProductModel extends IDBModel {
    title: string,
    slug: string,
    desc: string,
    price: number,
    discount: number,
    images: ICloudinaryIMage[],
    stock: number,
    supplierId: string;
    adminNotes: string;
    isActive: boolean;
    isDeleted: boolean;
    minimumOrderQuantity: number;
    appliedPrice: number;
    saleCounter: number;
}

export interface IProduct extends IProductModel {
    supplierData: ISupplier;
}

export interface ICreateProductQuery {
    title: string;
    desc: string;
    price: number;
    discount?: number;
    stock: number;
    minimumOrderQuantity: number;
}

export interface IUpdateProductQuery {
    title?: string;
    desc?: string;
    price?: number;
    discount?: number;
    stock?: number;
    minimumOrderQuantity?: number;
    updatedImagesIds?: string[];
    deletedImagesIds?: string[];
}


