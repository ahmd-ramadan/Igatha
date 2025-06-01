
import { ProductOrder } from "../models";
import { IProductOrder, IProductOrderModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const productOrderRepository = new GeneralRepository<IProductOrderModel, IProductOrder>(ProductOrder)