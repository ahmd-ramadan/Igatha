import { Schema, model } from "mongoose";
import { IRequestModel } from "../interfaces/request.interface";
import { RequestStatusEnum, RequestTypeEnum, UserRolesEnum } from "../enums";
import { ApiError, BAD_REQUEST } from "../utils";

const requestSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',       
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: Object.values(UserRolesEnum),
        required: true,
        index: true
    },
    currentData: { 
        type: Object, 
        required: false
    },
    requestedData: { 
        type: Object, 
        required: true 
    },
    status: { 
        type: String, 
        enum: Object.values(RequestStatusEnum),
        default: RequestStatusEnum.PENDING
    },
    rejectionReason: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: Object.values(RequestTypeEnum),
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

requestSchema.pre('save', async function(next) {
    if(this.isNew) {
        this.status = RequestStatusEnum.PENDING; 
    }
    next();
});

export const Request = model<IRequestModel>('Request', requestSchema);
