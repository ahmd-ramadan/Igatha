"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../enums");
const requestSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: Object.values(enums_1.UserRolesEnum),
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
        enum: Object.values(enums_1.RequestStatusEnum),
        default: enums_1.RequestStatusEnum.PENDING
    },
    rejectionReason: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: Object.values(enums_1.RequestTypeEnum),
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});
requestSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            this.status = enums_1.RequestStatusEnum.PENDING;
        }
        next();
    });
});
exports.Request = (0, mongoose_1.model)('Request', requestSchema);
