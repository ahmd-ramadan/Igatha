
import { ProductCart } from "../models";
import { IProductCart, IProductCartModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const productCartRepository = new GeneralRepository<IProductCartModel, IProductCart>(ProductCart)