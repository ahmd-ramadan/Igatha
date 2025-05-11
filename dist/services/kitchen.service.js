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
exports.kitchenService = void 0;
const config_1 = require("../config");
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const auth_service_1 = require("./auth.service");
const cloudinary_service_1 = require("./cloudinary.service");
const request_service_1 = require("./request.service");
const user_service_1 = require("./user.service");
class KitchenService {
    constructor(kitchenDataSource = repositories_1.kitchenRepository) {
        this.kitchenDataSource = kitchenDataSource;
    }
    isKitchenExist(kitchenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isKitchenExist = yield this.kitchenDataSource.findById(kitchenId);
            if (!isKitchenExist) {
                throw new utils_1.ApiError('مركز الإعاشة غير موجود', utils_1.NOT_FOUND);
            }
            return isKitchenExist;
        });
    }
    createKitchen(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, files }) {
            try {
                const { email } = data;
                const isKitchenExist = yield user_service_1.userService.isUserExistByEmail({
                    email,
                    role: enums_1.UserRolesEnum.KITCHEN
                });
                if (isKitchenExist) {
                    throw new utils_1.ApiError('هذا البريد الإلكتروني مستخدم بالفعل', utils_1.CONFLICT);
                }
                let newData = Object.assign(Object.assign({}, data), { commercialRegister: {}, workPermit: {} });
                console.log(files);
                if (files) {
                    if (files.avatar) {
                        const avatarImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.avatar[0].path,
                            folderPath: config_1.cloudinaryAvatarsFolder
                        });
                        newData.avatar = avatarImage;
                    }
                    if (!files.commercialRegisterImage && !files.commercialRegisterFile) {
                        throw new utils_1.ApiError('يجب عليك رفع صورة أو ملف السجل التجاري', utils_1.BAD_REQUEST);
                    }
                    if (files.commercialRegisterFile) {
                        const commercialRegisterFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        newData.commercialRegister = Object.assign(Object.assign({}, newData.commercialRegister), { file: commercialRegisterFile });
                    }
                    if (files.commercialRegisterImage) {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        newData.commercialRegister = Object.assign(Object.assign({}, newData.commercialRegister), { image: commercialRegisterImage });
                    }
                    if (!files.workPermitImage && !files.workPermitFile) {
                        throw new utils_1.ApiError('يجب عليك رفع صورة أو ملف تصريح العمل', utils_1.BAD_REQUEST);
                    }
                    if (files.workPermitFile) {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        newData.workPermit = Object.assign(Object.assign({}, newData.workPermit), { file: workPermitFile });
                    }
                    if (files.workPermitImage) {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        newData.workPermit = Object.assign(Object.assign({}, newData.workPermit), { image: workPermitImage });
                    }
                }
                console.log(newData);
                const kitchen = yield this.kitchenDataSource.createOne(newData);
                const token = (yield auth_service_1.authService.generateAndStoreTokens(kitchen)).refreshToken;
                yield auth_service_1.authService.sendVerificationEmail(kitchen);
                yield request_service_1.requestService.createRequest({
                    userId: kitchen._id,
                    role: enums_1.UserRolesEnum.KITCHEN,
                    currentData: kitchen,
                    requestedData: newData,
                    type: enums_1.RequestTypeEnum.NEW
                });
                //! notification to the admin with new kitchen
                //! notification to the kitchen with welcome message
                return {
                    kitchen,
                    token
                };
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ ما اثناء إنشاء مركز الإعاشة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateKitchen(_a) {
        return __awaiter(this, arguments, void 0, function* ({ kitchenId, data, files }) {
            var _b, _c, _d, _e, _f, _g, _h, _j;
            try {
                console.log("files", files);
                //! Have request Update 
                const requestIsExist = yield request_service_1.requestService.findRequest({ userId: kitchenId, role: enums_1.UserRolesEnum.KITCHEN, type: enums_1.RequestTypeEnum.UPDATE });
                const currentKitchen = yield this.isKitchenExist(kitchenId);
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
                if (files.commercialRegisterFile) {
                    const isKitchenHaveCommercialRegisterFile = ((_c = (_b = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _b === void 0 ? void 0 : _b.commercialRegister) === null || _c === void 0 ? void 0 : _c.file) || undefined;
                    if (isKitchenHaveCommercialRegisterFile) {
                        const commercialRegisteFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isKitchenHaveCommercialRegisterFile.public_id,
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { file: commercialRegisteFile });
                    }
                    else {
                        const commercialRegisterFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { file: commercialRegisterFile });
                    }
                }
                if (files.commercialRegisterImage) {
                    const isKitchenHaveCommercialRegisterImage = ((_e = (_d = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _d === void 0 ? void 0 : _d.commercialRegister) === null || _e === void 0 ? void 0 : _e.image) || undefined;
                    if (isKitchenHaveCommercialRegisterImage) {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isKitchenHaveCommercialRegisterImage.public_id,
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { image: commercialRegisterImage });
                    }
                    else {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { image: commercialRegisterImage });
                    }
                }
                if (files.workPermitFile) {
                    const isKitchenHaveWorkPermitFile = ((_g = (_f = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _f === void 0 ? void 0 : _f.workPermit) === null || _g === void 0 ? void 0 : _g.file) || undefined;
                    if (isKitchenHaveWorkPermitFile) {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isKitchenHaveWorkPermitFile.public_id,
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { file: workPermitFile });
                    }
                    else {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { file: workPermitFile });
                    }
                }
                if (files.workPermitImage) {
                    const isKitchenHaveWorkPermitImage = ((_j = (_h = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _h === void 0 ? void 0 : _h.workPermit) === null || _j === void 0 ? void 0 : _j.image) || undefined;
                    if (isKitchenHaveWorkPermitImage) {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isKitchenHaveWorkPermitImage.public_id,
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { image: workPermitImage });
                    }
                    else {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinaryKitchensFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { image: workPermitImage });
                    }
                    console.log(files.workPermitImage[0], isKitchenHaveWorkPermitImage);
                }
                // Update kitchen data
                const updatedKitchen = yield this.kitchenDataSource.updateOne({ _id: kitchenId }, updatedData);
                // Create update request instead of directly updating
                let request = requestIsExist || null;
                if (Object.keys(requestedUpdatedData).length > 0) {
                    if (requestIsExist) {
                        requestIsExist.requestedData = requestedUpdatedData;
                        request = yield request_service_1.requestService.updateRequest({ requestId: requestIsExist._id, userId: kitchenId, data: requestedUpdatedData });
                    }
                    else {
                        request = yield request_service_1.requestService.createRequest({
                            userId: kitchenId,
                            role: enums_1.UserRolesEnum.KITCHEN,
                            currentData: currentKitchen,
                            requestedData: requestedUpdatedData,
                            type: enums_1.RequestTypeEnum.UPDATE
                        });
                    }
                }
                return {
                    request,
                    kitchen: updatedKitchen
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
        return __awaiter(this, arguments, void 0, function* ({ kitchenId, data }) {
            const { commercialRegister, workPermit } = yield this.isKitchenExist(kitchenId);
            const updatedKitchen = yield this.kitchenDataSource.updateOne({ _id: kitchenId }, data);
            //! Delete cloudinary previous images
            if (commercialRegister) {
                if (commercialRegister.file) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(commercialRegister.file.public_id);
                }
                if (commercialRegister.image) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(commercialRegister.image.public_id);
                }
            }
            if (workPermit) {
                if (workPermit.file) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(workPermit.file.public_id);
                }
                if (workPermit.image) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(workPermit.image.public_id);
                }
            }
            return updatedKitchen;
        });
    }
}
exports.kitchenService = new KitchenService();
