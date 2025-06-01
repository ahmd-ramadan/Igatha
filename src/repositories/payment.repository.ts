import { IPayment, IPaymentModel } from "../interfaces";
import { Payment } from "../models";
import GeneralRepository from "./general.repository";


export const paymentRepository = new GeneralRepository<IPaymentModel, IPayment>(Payment)
