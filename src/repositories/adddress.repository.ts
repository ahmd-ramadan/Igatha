
import { Address } from "../models";
import { IAddressModel, IAddress } from "../interfaces";
import GeneralRepository from "./general.repository";

export const addressRepository = new GeneralRepository<IAddressModel, IAddress>(Address)