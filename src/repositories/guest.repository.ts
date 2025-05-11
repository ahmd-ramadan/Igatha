
import { Guest } from "../models";
import { IGuestModel, IGuest } from "../interfaces";
import GeneralRepository from "./general.repository";

export const guestRepository = new GeneralRepository<IGuestModel, IGuest>(Guest)