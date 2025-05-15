
import { Product } from "../models";
import { IProduct, IProductModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const productRepository = new GeneralRepository<IProductModel, IProduct>(Product)