
import { Surplus } from "../models";
import { ISurplusModel, ISurplus } from "../interfaces";
import GeneralRepository from "./general.repository";

export const surplusRepository = new GeneralRepository<ISurplusModel, ISurplus>(Surplus)