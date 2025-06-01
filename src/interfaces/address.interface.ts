import { IDBModel } from "./database.interface";
import { IUser } from "./user.interface";

export interface IAddressModel extends IDBModel {
    userId: string;
    first_name: string;
    last_name: string,
    phone_number: string,
    apartment: string,
    floor: string,
    building: string,
    street: string,
    city: string,
    state: string,
    postal_code: string,
}

export interface IAddress extends IAddressModel {
    userData: IUser
}

export interface ICreateAddressQuery {
    userId: string;
    first_name: string;
    last_name: string,
    phone_number: string,
    apartment: string,
    floor: string,
    building: string,
    street: string,
    city: string,
    state: string,
    postal_code: string,
}