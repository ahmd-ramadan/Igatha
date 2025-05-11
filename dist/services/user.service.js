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
exports.userService = void 0;
const config_1 = require("../config");
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const campaign_service_1 = require("./campaign.service");
const cloudinary_service_1 = require("./cloudinary.service");
const hashing_service_1 = require("./hashing.service");
const kitchen_service_1 = require("./kitchen.service");
class UserService {
    constructor(userDataSource = repositories_1.userRepository) {
        this.userDataSource = userDataSource;
    }
    isUserExist(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserExist = yield this.userDataSource.findById(userId);
            if (!isUserExist) {
                throw new utils_1.ApiError('هذا المستخدم غير موجود', utils_1.NOT_FOUND);
            }
            return isUserExist;
        });
    }
    isUserExistByEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, role }) {
            const isUserExist = yield this.userDataSource.findOne({ email, role });
            return isUserExist ? true : false;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDataSource.findOne({ email });
        });
    }
    createNewUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDataSource.createOne(data);
        });
    }
    updateOne(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, role, data }) {
            if (role === enums_1.UserRolesEnum.CAMPAIGN) {
                return yield campaign_service_1.campaignService.updateOne({ campaignId: userId, data });
            }
            // if (role === UserRolesEnum.CHARITY) {
            //     return await charityService.updateOne({ charityId: userId, data })
            // } 
            if (role === enums_1.UserRolesEnum.KITCHEN) {
                return yield kitchen_service_1.kitchenService.updateOne({ kitchenId: userId, data });
            }
            // if (role === UserRolesEnum.SUPPLIER) {
            //     return await supplierService.updateOne({ supplierId: userId, data })
            // } if (role === UserRolesEnum.GUEST) { 
            //     return await guestService.updateOne({ guestId: userId, data })
            // } if (role === UserRolesEnum.ADMIN) {
            //     return await adminService.updateOne({ adminId: userId, data })
            // }
            return yield this.userDataSource.updateOne({ _id: userId }, data);
        });
    }
    updateProfile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, data, files }) {
            const { name, phone } = data;
            const { avatar, role } = yield this.isUserExist(userId);
            const updatedData = {};
            if (name)
                updatedData.name = name;
            if (phone)
                updatedData.phone = phone;
            if (files && files.length) {
                const { secure_url, public_id } = yield cloudinary_service_1.cloudinaryService.uploadImage({
                    fileToUpload: files[0].path,
                    folderPath: config_1.cloudinaryAvatarsFolder
                });
                if ((avatar === null || avatar === void 0 ? void 0 : avatar.secure_url) && (avatar === null || avatar === void 0 ? void 0 : avatar.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(avatar === null || avatar === void 0 ? void 0 : avatar.public_id);
                }
                updatedData.avatar = {
                    secure_url,
                    public_id
                };
            }
            return yield this.updateOne({ userId, role, data: updatedData });
        });
    }
    updatePassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, oldPassword, newPassword }) {
            const { password, role } = yield this.isUserExist(userId);
            const isMatched = yield hashing_service_1.HashingService.compare(oldPassword, password);
            if (!isMatched) {
                throw new utils_1.ApiError('كلمة المرور القديمة غير صحيحة', utils_1.CONFLICT);
            }
            const hashedPassword = yield hashing_service_1.HashingService.hash(newPassword);
            return yield this.updateOne({ userId, role, data: { password: hashedPassword } });
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDataSource.findById(userId);
        });
    }
    findAllUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, size, role }) {
            const { limit, skip } = (0, utils_1.pagination)({ page, size });
            let query = {};
            if (role)
                query.role = role;
            return this.userDataSource.find(query, { skip, limit });
        });
    }
}
exports.userService = new UserService();
