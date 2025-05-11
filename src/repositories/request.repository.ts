import { Request } from "../models";
import { IRequestModel, IRequest } from "../interfaces";
import GeneralRepository from "./general.repository";

export const requestRepository = new GeneralRepository<IRequestModel, IRequest>(Request)