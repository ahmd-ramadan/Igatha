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
exports.getAllAddressesForUser = exports.updateAddress = exports.createAddress = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
const address_validation_1 = require("../validation/address.validation");
const validation_1 = require("../validation");
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = address_validation_1.createAddressSchema.parse(req.body);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const newAdress = yield services_1.addressService.createNewAddress(Object.assign({ userId }, data));
    res.status(utils_1.CREATED).json({
        success: true,
        message: 'تم إنشاء العنوان بنجاح',
        data: newAdress,
    });
});
exports.createAddress = createAddress;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id: addressId } = validation_1.paramsSchema.parse(req.params);
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = address_validation_1.updateAddressSchema.parse(req.body);
    const updatedAddress = yield services_1.addressService.updateAddressById({ addressId, data, userId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث العنوان بنجاح',
        data: updatedAddress,
    });
});
exports.updateAddress = updateAddress;
const getAllAddressesForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const addressesForUser = yield services_1.addressService.findManyAddressByUserId(userId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم ارجاع كل العنواين الخاصة بك بنجاح',
        data: addressesForUser,
    });
});
exports.getAllAddressesForUser = getAllAddressesForUser;
