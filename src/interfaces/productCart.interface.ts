import { IDBModel } from "./database.interface";
import { IKitchenModel } from "./kitchen.interface";

export interface IProductCartModel extends IDBModel {
    kitchenId: string;
    products: {
        productId: string;
        price: number;
        quantity: number;
        note?: string;
    }[];
    totalPrice: number;
}

export interface IProductCart extends IProductCartModel {
    kitchenData: IKitchenModel;
}

export interface ICreateProductCart {
    kitchenId: string;
    products: {
        productId: string;
        price: number;
        quantity: number;
        note?: string
    }[];
}

export interface IAddProductToCart {
    kitchenId: string;
    productId: string;
    quantity: number;
    note?: string
}

export interface IUpdateProductCartProductData {
    productId: string;
    price: number;
    quantity: number;
    note?: string;
}
