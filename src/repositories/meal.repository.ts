
import { Meal } from "../models";
import { IMeal, IMealModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const mealRepository = new GeneralRepository<IMealModel, IMeal>(Meal)