
import { Charity } from "../models";
import { ICharity, ICharityModel } from "../interfaces";
import GeneralRepository from "./general.repository";

export const charityRepository = new GeneralRepository<ICharityModel, ICharity>(Charity)