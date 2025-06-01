"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../enums");
const enums_2 = require("../enums");
const paymentSchema = new mongoose_1.Schema({
    orderType: {
        type: String,
        enum: Object.values(enums_1.OrderTypes),
        required: true
    },
    fromUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'fromUserModel',
        required: true
    },
    fromUserModel: {
        type: String,
        enum: [enums_1.UserRolesEnum.CAMPAIGN, enums_1.UserRolesEnum.KITCHEN],
        required: true
    },
    toUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'toUserModel',
        required: true
    },
    toUserModel: {
        type: String,
        enum: [enums_1.UserRolesEnum.KITCHEN, enums_1.UserRolesEnum.SUPPLIER],
        required: true
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'orderModel',
        required: true
    },
    orderModel: {
        type: String,
        enum: [enums_1.OrderTypes.MEAL_ORDER, enums_1.OrderTypes.PRODUCT_ORDER],
        required: true
    },
    method: {
        type: String,
        enum: Object.values(enums_2.PaymentMethod),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(enums_1.PaymentStatus),
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
}, {
    timestamps: true,
});
paymentSchema.pre('save', function (next) {
    if (this.orderType === enums_1.OrderTypes.MEAL_ORDER) {
        this.fromUserModel = enums_1.UserRolesEnum.CAMPAIGN;
        this.toUserModel = enums_1.UserRolesEnum.KITCHEN;
        this.orderModel = enums_1.OrderTypes.MEAL_ORDER;
    }
    else if (this.orderType === enums_1.OrderTypes.PRODUCT_ORDER) {
        this.fromUserModel = enums_1.UserRolesEnum.KITCHEN;
        this.toUserModel = enums_1.UserRolesEnum.SUPPLIER;
        this.orderModel = enums_1.OrderTypes.PRODUCT_ORDER;
    }
    next();
});
paymentSchema.virtual('toUserData', {
    ref: function () {
        return this.toUserModel;
    },
    foreignField: '_id',
    localField: 'toUserId',
    justOne: false
});
paymentSchema.virtual('fromUserData', {
    ref: function () {
        return this.fromUserModel;
    },
    foreignField: '_id',
    localField: 'fromUserId',
    justOne: false
});
paymentSchema.virtual('orderData', {
    ref: function () {
        return this.orderModel;
    },
    foreignField: '_id',
    localField: 'orderId',
    justOne: false
});
exports.Payment = (0, mongoose_1.model)('Payment', paymentSchema);
