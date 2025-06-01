import { model, Schema } from "mongoose";
import { OrderTypes, PaymentStatus, UserRolesEnum } from "../enums";
import { PaymentMethod } from "../enums";
import { IPaymentModel } from "../interfaces";


const paymentSchema = new Schema({
    orderType: { 
        type: String, 
        enum: Object.values(OrderTypes), 
        required: true 
    },
    fromUser: { 
        type: Schema.Types.ObjectId, 
        refPath: 'fromUserModel',
        required: true
    },
    fromUserModel: {
        type: String,
        enum: [UserRolesEnum.CAMPAIGN, UserRolesEnum.KITCHEN],
        required: true
    },
    toUser: { 
        type: Schema.Types.ObjectId, 
        refPath: 'toUserModel',
        required: true
    },
    toUserModel: {
        type: String,
        enum: [UserRolesEnum.KITCHEN, UserRolesEnum.SUPPLIER],
        required: true
    },
    orderId: { 
        type: Schema.Types.ObjectId, 
        refPath: 'orderModel',
        required: true 
    },
    orderModel: {
        type: String,
        enum: [OrderTypes.MEAL_ORDER, OrderTypes.PRODUCT_ORDER],
        required: true
    },
    method: { 
        type: String, 
        enum: Object.values(PaymentMethod), 
        required: true 
    },
    status: { 
        type: String, 
        enum: Object.values(PaymentStatus), 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
}, { 
    timestamps: true,
});

paymentSchema.pre('save', function(next) {
    if (this.orderType === OrderTypes.MEAL_ORDER) {
        this.fromUserModel = UserRolesEnum.CAMPAIGN;
        this.toUserModel = UserRolesEnum.KITCHEN;
        this.orderModel = OrderTypes.MEAL_ORDER;
    } else if (this.orderType === OrderTypes.PRODUCT_ORDER) {
        this.fromUserModel = UserRolesEnum.KITCHEN;
        this.toUserModel = UserRolesEnum.SUPPLIER;
        this.orderModel = OrderTypes.PRODUCT_ORDER;
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
})

paymentSchema.virtual('fromUserData', {
    ref: function () {
        return this.fromUserModel;
    },
    foreignField: '_id',
    localField: 'fromUserId',
    justOne: false
})

paymentSchema.virtual('orderData', {
    ref: function () {
        return this.orderModel;
    },
    foreignField: '_id',
    localField: 'orderId',
    justOne: false
})

export const Payment = model<IPaymentModel>('Payment', paymentSchema);
