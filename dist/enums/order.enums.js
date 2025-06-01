"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTypes = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderTypes;
(function (OrderTypes) {
    OrderTypes["PRODUCT_ORDER"] = "ProductOrder";
    OrderTypes["MEAL_ORDER"] = "MealOrder";
})(OrderTypes || (exports.OrderTypes = OrderTypes = {}));
