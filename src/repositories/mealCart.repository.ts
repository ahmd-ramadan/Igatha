
import { MealCart } from "../models";
import { IMealCart, IMealCartModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const mealCartRepository = new GeneralRepository<IMealCartModel, IMealCart>(MealCart)