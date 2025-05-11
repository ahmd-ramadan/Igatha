"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTypeEnum = exports.RequestStatusEnum = void 0;
var RequestStatusEnum;
(function (RequestStatusEnum) {
    RequestStatusEnum["PENDING"] = "pending";
    RequestStatusEnum["APPROVED"] = "approved";
    RequestStatusEnum["REJECTED"] = "rejected";
})(RequestStatusEnum || (exports.RequestStatusEnum = RequestStatusEnum = {}));
var RequestTypeEnum;
(function (RequestTypeEnum) {
    RequestTypeEnum["NEW"] = "new";
    RequestTypeEnum["UPDATE"] = "update";
})(RequestTypeEnum || (exports.RequestTypeEnum = RequestTypeEnum = {}));
