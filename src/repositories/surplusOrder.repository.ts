
import { SurplusOrder } from "../models";
import { ISurplusOrderModel, ISurplusOrder } from "../interfaces";
import GeneralRepository from "./general.repository";

export const surplusOrderRepository = new GeneralRepository<ISurplusOrderModel, ISurplusOrder>(SurplusOrder)