"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProductOrder = exports.accessToProductOrder = exports.manageProductOrder = void 0;
const enums_1 = require("../enums");
exports.manageProductOrder = [
    enums_1.UserRolesEnum.KITCHEN
];
exports.accessToProductOrder = [
    enums_1.UserRolesEnum.SUPPLIER
];
exports.toProductOrder = [
    enums_1.UserRolesEnum.KITCHEN,
    enums_1.UserRolesEnum.SUPPLIER,
    enums_1.UserRolesEnum.ADMIN
];
