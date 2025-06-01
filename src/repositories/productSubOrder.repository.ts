
import { ProductSubOrder } from "../models";
import { IProductSubOrder, IProductSubOrderModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const productSubOrderRepository = new GeneralRepository<IProductSubOrderModel, IProductSubOrder>(ProductSubOrder)