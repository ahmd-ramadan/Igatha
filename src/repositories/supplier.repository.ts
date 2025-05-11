
import { Supplier } from "../models";
import { ISupplierModel, ISupplier } from "../interfaces";
import GeneralRepository from "./general.repository";

export const supplierRepository = new GeneralRepository<ISupplierModel, ISupplier>(Supplier)