import { any, z } from "zod";
import { MongoDBObjectId } from "../utils";
import { RequestStatusEnum, RequestTypeEnum, UserRolesEnum } from "../enums";
import { updateCampaignSchema } from "./campaign.validation";

export const getAllRequestsSchema = z.object({
    userId: z.string().regex(MongoDBObjectId).optional(),
    role: z.nativeEnum(UserRolesEnum).optional(),
    status: z.nativeEnum(RequestStatusEnum).optional(),
    type: z.nativeEnum(RequestTypeEnum).optional(),
})

export const rejectOnRequestSchema = z.object({
    rejectionReason: z.string().min(1, "يجب أن يكون السبب على الأقل 1 حرف")
})

//! all extends from all updates profiles schemas
//! to avoid inputs errors
export const updateRequestSchema = z.any()
