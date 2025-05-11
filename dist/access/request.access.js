"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessOnRequest = exports.manageRequest = exports.getRequest = void 0;
const enums_1 = require("../enums");
exports.getRequest = [
    enums_1.UserRolesEnum.ADMIN,
    enums_1.UserRolesEnum.SUPPLIER,
    enums_1.UserRolesEnum.KITCHEN,
    enums_1.UserRolesEnum.CHARITY,
    enums_1.UserRolesEnum.CAMPAIGN
];
exports.manageRequest = [
    enums_1.UserRolesEnum.SUPPLIER,
    enums_1.UserRolesEnum.KITCHEN,
    enums_1.UserRolesEnum.CHARITY,
    enums_1.UserRolesEnum.CAMPAIGN
];
exports.accessOnRequest = [
    enums_1.UserRolesEnum.ADMIN
];
