import { IDBModel } from "./database.interface";
import { IKitchenModel } from "./kitchen.interface";

export interface IMealCartModel extends IDBModel {
    campaignId: string;
    meals: IMealCartMeal[];
    totalPrice: number;
}

export interface IMealCart extends IMealCartModel {
    kitchenData: IKitchenModel;
}

export interface IMealCartMeal {
    mealId: string;
    kitchenId: string;
    price: number;
    quantity: number;
    note?: string;
};

export interface ICreateMealCart {
    campaignId: string;
    meals: IMealCartMeal[]
}

export interface IAddMealToCart {
    kitchenId: string;
    mealId: string;
    quantity: number;
    note?: string
}

export interface IUpdateMealMealCartData {
    mealId: string;
    price: number;
    quantity: number;
    note?: string;
}
