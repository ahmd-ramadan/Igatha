
import { MealOrder } from "../models";
import { IMealOrder, IMealOrderModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const mealOrderRepository = new GeneralRepository<IMealOrderModel, IMealOrder>(MealOrder)