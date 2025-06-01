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
exports.charityService = void 0;
const config_1 = require("../config");
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const auth_service_1 = require("./auth.service");
const cloudinary_service_1 = require("./cloudinary.service");
const hashing_service_1 = require("./hashing.service");
const request_service_1 = require("./request.service");
const user_service_1 = require("./user.service");
class CharityService {
    constructor(charityDataSource = repositories_1.charityRepository) {
        this.charityDataSource = charityDataSource;
    }
    isCharityExist(charityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isCharityExist = yield this.charityDataSource.findById(charityId);
            if (!isCharityExist) {
                throw new utils_1.ApiError('الجمعية الخيرية غير موجودة', utils_1.NOT_FOUND);
            }
            return isCharityExist;
        });
    }
    createCharity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, files }) {
            try {
                const { email, password } = data;
                const isCharityExist = yield user_service_1.userService.isUserExistByEmail({
                    email,
                    role: enums_1.UserRolesEnum.CHARITY
                });
                if (isCharityExist) {
                    throw new utils_1.ApiError('هذا البريد الإلكتروني مستخدم بالفعل', utils_1.CONFLICT);
                }
                let newData = Object.assign(Object.assign({}, data), { password: yield hashing_service_1.HashingService.hash(password), workPermit: {} });
                console.log(files);
                if (files) {
                    if (files.avatar) {
                        const avatarImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.avatar[0].path,
                            folderPath: config_1.cloudinaryAvatarsFolder
                        });
                        newData.avatar = avatarImage;
                    }
                    if (!files.workPermitImage && !files.workPermitFile) {
                        throw new utils_1.ApiError('يجب عليك رفع صورة أو ملف تصريح العمل', utils_1.BAD_REQUEST);
                    }
                    if (files.workPermitFile) {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinaryCharitiesFolder
                        });
                        newData.workPermit = Object.assign(Object.assign({}, newData.workPermit), { file: workPermitFile });
                    }
                    if (files.workPermitImage) {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinaryCharitiesFolder
                        });
                        newData.workPermit = Object.assign(Object.assign({}, newData.workPermit), { image: workPermitImage });
                    }
                }
                console.log(newData);
                const charity = yield this.charityDataSource.createOne(newData);
                const token = (yield auth_service_1.authService.generateAndStoreTokens(charity)).refreshToken;
                yield auth_service_1.authService.sendVerificationEmail(charity);
                yield request_service_1.requestService.createRequest({
                    userId: charity._id,
                    role: enums_1.UserRolesEnum.CHARITY,
                    currentData: charity,
                    requestedData: newData,
                    type: enums_1.RequestTypeEnum.NEW
                });
                //! notification to the admin with new charity
                //! notification to the charity with welcome message
                return {
                    charity,
                    token
                };
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ ما اثناء إنشاء حساب الجمعية الخيرية', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateCharity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ charityId, data, files }) {
            var _b, _c, _d, _e, _f;
            try {
                console.log("files", files);
                //! Have request Update 
                const requestIsExist = yield request_service_1.requestService.findRequest({ userId: charityId, role: enums_1.UserRolesEnum.CHARITY, type: enums_1.RequestTypeEnum.UPDATE });
                const currentCharity = yield this.isCharityExist(charityId);
                const updatedData = {};
                // Can UpdatesData 
                if (data.phone)
                    updatedData.phone = data.phone;
                if (files.avatar) {
                    const avatarImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                        fileToUpload: files.avatar[0].path,
                        folderPath: config_1.cloudinaryAvatarsFolder
                    });
                    updatedData.avatar = avatarImage;
                }
                // Requests Updated Data to Admin
                const requestedUpdatedData = {};
                if (data.name)
                    requestedUpdatedData.name = data.name;
                if (data.address)
                    requestedUpdatedData.address = data.address;
                if (files.workPermitFile) {
                    const isCharityHaveWorkPermitFile = ((_c = (_b = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _b === void 0 ? void 0 : _b.workPermit) === null || _c === void 0 ? void 0 : _c.file) || undefined;
                    if (isCharityHaveWorkPermitFile) {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isCharityHaveWorkPermitFile.public_id,
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinaryCharitiesFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { file: workPermitFile });
                    }
                    else {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinaryCharitiesFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { file: workPermitFile });
                    }
                }
                if (files.workPermitImage) {
                    const isCharityHaveWorkPermitImage = ((_e = (_d = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _d === void 0 ? void 0 : _d.workPermit) === null || _e === void 0 ? void 0 : _e.image) || undefined;
                    if (isCharityHaveWorkPermitImage) {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isCharityHaveWorkPermitImage.public_id,
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinaryCharitiesFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { image: workPermitImage });
                    }
                    else {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinaryCharitiesFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { image: workPermitImage });
                    }
                    console.log(files.workPermitImage[0], isCharityHaveWorkPermitImage);
                }
                // Update charity data
                const updatedCharity = yield this.charityDataSource.updateOne({ _id: charityId }, updatedData);
                if (updatedData.avatar && ((_f = currentCharity === null || currentCharity === void 0 ? void 0 : currentCharity.avatar) === null || _f === void 0 ? void 0 : _f.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(currentCharity.avatar.public_id);
                }
                // Create update request instead of directly updating
                let request = requestIsExist || null;
                if (Object.keys(requestedUpdatedData).length > 0) {
                    if (requestIsExist) {
                        requestIsExist.requestedData = requestedUpdatedData;
                        request = yield request_service_1.requestService.updateRequest({ requestId: requestIsExist._id, userId: charityId, data: requestedUpdatedData });
                    }
                    else {
                        request = yield request_service_1.requestService.createRequest({
                            userId: charityId,
                            role: enums_1.UserRolesEnum.CHARITY,
                            currentData: currentCharity,
                            requestedData: requestedUpdatedData,
                            type: enums_1.RequestTypeEnum.UPDATE
                        });
                    }
                }
                return {
                    request,
                    charity: updatedCharity
                };
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء إنشاء الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateOne(_a) {
        return __awaiter(this, arguments, void 0, function* ({ charityId, data }) {
            var _b, _c, _d, _e;
            const { workPermit } = yield this.isCharityExist(charityId);
            const updatedCharity = yield this.charityDataSource.updateOne({ _id: charityId }, data);
            //! Delete cloudinary previous images
            if (data === null || data === void 0 ? void 0 : data.workPermit) {
                if (((_b = data.workPermit) === null || _b === void 0 ? void 0 : _b.file) && ((_c = workPermit === null || workPermit === void 0 ? void 0 : workPermit.file) === null || _c === void 0 ? void 0 : _c.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(workPermit.file.public_id);
                }
                if (((_d = data.workPermit) === null || _d === void 0 ? void 0 : _d.image) && ((_e = workPermit === null || workPermit === void 0 ? void 0 : workPermit.image) === null || _e === void 0 ? void 0 : _e.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(workPermit.image.public_id);
                }
            }
            return this.updateCharity;
        });
    }
}
exports.charityService = new CharityService();
