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
exports.addressService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
class AddressService {
    constructor(addressDataSource = repositories_1.addressRepository) {
        this.addressDataSource = addressDataSource;
    }
    findAddressById(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const populateObject = ['userData'];
            return yield this.addressDataSource.findByIdWithPopulate(addressId, populateObject);
        });
    }
    createNewAddress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.addressDataSource.createOne(data);
            }
            catch (err) {
                throw new utils_1.ApiError('فشلت عملية إضافة عنوان جديد', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    isAddressExist(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressExist = yield this.findAddressById(addressId);
            if (!addressExist) {
                throw new utils_1.ApiError(`العنوان غير موجود`, utils_1.CONFLICT);
            }
            return addressExist;
        });
    }
    updateAddressById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ addressId, data, userId }) {
            const address = yield this.isAddressExist(addressId);
            if (address.userId.toString() !== userId.toString()) {
                throw new utils_1.ApiError(`لا يمكن تحديث هذا العنوان`, utils_1.CONFLICT);
            }
            return yield this.addressDataSource.updateOne({ _id: addressId }, data);
        });
    }
    findManyAddressByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.addressDataSource.find({ userId });
        });
    }
}
exports.addressService = new AddressService();
