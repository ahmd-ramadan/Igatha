
import { Campaign } from "../models";
import {ICampaginModel, ICampaign } from "../interfaces";
import GeneralRepository from "./general.repository";

export const campaignRepository = new GeneralRepository<ICampaginModel, ICampaign>(Campaign)