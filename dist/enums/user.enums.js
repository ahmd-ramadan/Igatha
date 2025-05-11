"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatusEnum = exports.UserRolesEnum = exports.UserGender = void 0;
var UserGender;
(function (UserGender) {
    UserGender["MALE"] = "male";
    UserGender["FEMALE"] = "female";
})(UserGender || (exports.UserGender = UserGender = {}));
var UserRolesEnum;
(function (UserRolesEnum) {
    UserRolesEnum["ADMIN"] = "Admin";
    UserRolesEnum["CAMPAIGN"] = "Campaign";
    UserRolesEnum["KITCHEN"] = "Kitchen";
    UserRolesEnum["SUPPLIER"] = "Supplier";
    UserRolesEnum["CHARITY"] = "Charity";
    UserRolesEnum["GUEST"] = "Guest";
})(UserRolesEnum || (exports.UserRolesEnum = UserRolesEnum = {}));
var UserStatusEnum;
(function (UserStatusEnum) {
    UserStatusEnum["PENDING"] = "pending";
    UserStatusEnum["APPROVED"] = "approved";
    UserStatusEnum["REJECTED"] = "rejected";
})(UserStatusEnum || (exports.UserStatusEnum = UserStatusEnum = {}));
