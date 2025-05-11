
import { Kitchen } from "../models";
import { IKitchenModel, IKitchen } from "../interfaces";
import GeneralRepository from "./general.repository";

export const kitchenRepository = new GeneralRepository<IKitchenModel, IKitchen>(Kitchen)