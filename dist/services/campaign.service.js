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
exports.campaignService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const cloudinary_service_1 = require("./cloudinary.service");
const config_1 = require("../config");
const user_service_1 = require("./user.service");
const enums_1 = require("../enums");
const request_service_1 = require("./request.service");
const auth_service_1 = require("./auth.service");
const hashing_service_1 = require("./hashing.service");
class CampaignService {
    constructor(campaignDataSource = repositories_1.campaignRepository) {
        this.campaignDataSource = campaignDataSource;
    }
    isCampaignExist(campaignId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isCampaignExist = yield this.campaignDataSource.findById(campaignId);
            if (!isCampaignExist) {
                throw new utils_1.ApiError('هذه الحملة غير موجود', utils_1.NOT_FOUND);
            }
            return isCampaignExist;
        });
    }
    createCampaign(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, files }) {
            try {
                const { email, password } = data;
                const isCampaignExist = yield user_service_1.userService.isUserExistByEmail({
                    email,
                    role: enums_1.UserRolesEnum.CAMPAIGN
                });
                if (isCampaignExist) {
                    throw new utils_1.ApiError('هذا البريد الإلكتروني مستخدم بالفعل', utils_1.CONFLICT);
                }
                let newData = Object.assign(Object.assign({}, data), { password: yield hashing_service_1.HashingService.hash(password), commercialRegister: {}, hajjReference: {} });
                console.log(files);
                if (files) {
                    if (files.avatar) {
                        const avatarImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.avatar[0].path,
                            folderPath: config_1.cloudinaryAvatarsFolder
                        });
                        newData.avatar = {
                            secure_url: avatarImage.secure_url,
                            public_id: avatarImage.public_id
                        };
                    }
                    if (!files.commercialRegisterImage && !files.commercialRegisterFile) {
                        throw new utils_1.ApiError('يجب عليك رفع صورة أو ملف السجل التجاري', utils_1.BAD_REQUEST);
                    }
                    if (files.commercialRegisterFile) {
                        const commercialRegisterFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        newData.commercialRegister = Object.assign(Object.assign({}, newData.commercialRegister), { file: commercialRegisterFile });
                    }
                    if (files.commercialRegisterImage) {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        newData.commercialRegister = Object.assign(Object.assign({}, newData.commercialRegister), { image: commercialRegisterImage });
                    }
                    if (!files.hajjReferenceImage && !files.hajjReferenceFile) {
                        throw new utils_1.ApiError('يجب عليك رفع صورة أو ملف تصريح الحج', utils_1.BAD_REQUEST);
                    }
                    if (files.hajjReferenceFile) {
                        const hajjReferenceFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.hajjReferenceFile[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        newData.hajjReference = Object.assign(Object.assign({}, newData.hajjReference), { file: hajjReferenceFile });
                    }
                    if (files.hajjReferenceImage) {
                        const hajjReferenceImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.hajjReferenceImage[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        newData.hajjReference = Object.assign(Object.assign({}, newData.hajjReference), { image: hajjReferenceImage });
                    }
                }
                console.log(newData);
                const campaign = yield this.campaignDataSource.createOne(newData);
                const token = (yield auth_service_1.authService.generateAndStoreTokens(campaign)).refreshToken;
                yield auth_service_1.authService.sendVerificationEmail(campaign);
                yield request_service_1.requestService.createRequest({
                    userId: campaign._id,
                    role: enums_1.UserRolesEnum.CAMPAIGN,
                    currentData: campaign,
                    requestedData: newData,
                    type: enums_1.RequestTypeEnum.NEW
                });
                //! notification to the admin with new campaign
                //! notification to the campaign with welcome message
                return {
                    campaign,
                    token
                };
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ ما اثناء إنشاء الحملة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateCampaign(_a) {
        return __awaiter(this, arguments, void 0, function* ({ campaignId, data, files }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k;
            try {
                console.log("files", files);
                //! Have request Update 
                const requestIsExist = yield request_service_1.requestService.findRequest({ userId: campaignId, role: enums_1.UserRolesEnum.CAMPAIGN, type: enums_1.RequestTypeEnum.UPDATE });
                const currentCampaign = yield this.isCampaignExist(campaignId);
                const updatedData = {};
                // Can UpdatesData 
                if (data.phone)
                    updatedData.phone = data.phone;
                if (files.avatar) {
                    const { secure_url, public_id } = yield cloudinary_service_1.cloudinaryService.uploadImage({
                        fileToUpload: files.avatar[0].path,
                        folderPath: config_1.cloudinaryAvatarsFolder
                    });
                    updatedData.avatar = {
                        secure_url,
                        public_id
                    };
                }
                // Requests Updated Data to Admin
                const requestedUpdatedData = {};
                if (data.name)
                    requestedUpdatedData.name = data.name;
                if (data.country)
                    requestedUpdatedData.country = data.country;
                if (data.pilgrimsCount)
                    requestedUpdatedData.pilgrimsCount = data.pilgrimsCount;
                if (files.commercialRegisterFile) {
                    const isCampaignHaveCommercialRegisterFile = ((_c = (_b = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _b === void 0 ? void 0 : _b.commercialRegister) === null || _c === void 0 ? void 0 : _c.file) || undefined;
                    if (isCampaignHaveCommercialRegisterFile) {
                        const commercialRegisteFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isCampaignHaveCommercialRegisterFile.public_id,
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { file: commercialRegisteFile });
                    }
                    else {
                        const commercialRegisterFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { file: commercialRegisterFile });
                    }
                }
                if (files.commercialRegisterImage) {
                    const isCampaignHaveCommercialRegisterImage = ((_e = (_d = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _d === void 0 ? void 0 : _d.commercialRegister) === null || _e === void 0 ? void 0 : _e.image) || undefined;
                    if (isCampaignHaveCommercialRegisterImage) {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isCampaignHaveCommercialRegisterImage.public_id,
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { image: commercialRegisterImage });
                    }
                    else {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { image: commercialRegisterImage });
                    }
                }
                if (files.hajjReferenceFile) {
                    const isCampaignHaveHajjReferenceFile = ((_g = (_f = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _f === void 0 ? void 0 : _f.hajjReference) === null || _g === void 0 ? void 0 : _g.file) || undefined;
                    if (isCampaignHaveHajjReferenceFile) {
                        const hajjReferenceFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isCampaignHaveHajjReferenceFile.public_id,
                            fileToUpload: files.hajjReferenceFile[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.hajjReference = Object.assign(Object.assign({}, requestedUpdatedData.hajjReference), { file: hajjReferenceFile });
                    }
                    else {
                        const hajjReferenceFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.hajjReferenceFile[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.hajjReference = Object.assign(Object.assign({}, requestedUpdatedData.hajjReference), { file: hajjReferenceFile });
                    }
                }
                if (files.hajjReferenceImage) {
                    const isCampaignHaveHajjReferenceImage = ((_j = (_h = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _h === void 0 ? void 0 : _h.hajjReference) === null || _j === void 0 ? void 0 : _j.image) || undefined;
                    if (isCampaignHaveHajjReferenceImage) {
                        const hajjReferenceImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isCampaignHaveHajjReferenceImage.public_id,
                            fileToUpload: files.hajjReferenceImage[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.hajjReference = Object.assign(Object.assign({}, requestedUpdatedData.hajjReference), { image: hajjReferenceImage });
                    }
                    else {
                        const hajjReferenceImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.hajjReferenceImage[0].path,
                            folderPath: config_1.cloudinaryCampaignsFolder
                        });
                        requestedUpdatedData.hajjReference = Object.assign(Object.assign({}, requestedUpdatedData.hajjReference), { image: hajjReferenceImage });
                    }
                    console.log(files.hajjReferenceImage[0], isCampaignHaveHajjReferenceImage);
                }
                // Update campaign data
                const updatedCampaign = yield this.campaignDataSource.updateOne({ _id: campaignId }, updatedData);
                if (updatedData.avatar && ((_k = currentCampaign === null || currentCampaign === void 0 ? void 0 : currentCampaign.avatar) === null || _k === void 0 ? void 0 : _k.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(currentCampaign.avatar.public_id);
                }
                // Create update request instead of directly updating
                let request = requestIsExist || null;
                if (Object.keys(requestedUpdatedData).length > 0) {
                    if (requestIsExist) {
                        requestIsExist.requestedData = requestedUpdatedData;
                        request = yield request_service_1.requestService.updateRequest({ requestId: requestIsExist._id, userId: campaignId, data: requestedUpdatedData });
                    }
                    else {
                        request = yield request_service_1.requestService.createRequest({
                            userId: campaignId,
                            role: enums_1.UserRolesEnum.CAMPAIGN,
                            currentData: currentCampaign,
                            requestedData: requestedUpdatedData,
                            type: enums_1.RequestTypeEnum.UPDATE
                        });
                    }
                }
                return {
                    request,
                    campaign: updatedCampaign
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
        return __awaiter(this, arguments, void 0, function* ({ campaignId, data }) {
            var _b, _c, _d, _e, _f, _g, _h, _j;
            const { commercialRegister, hajjReference } = yield this.isCampaignExist(campaignId);
            const updatedCampaign = yield this.campaignDataSource.updateOne({ _id: campaignId }, data);
            //! Delete cloudinary previous images
            if (data === null || data === void 0 ? void 0 : data.commercialRegister) {
                if (((_b = data.commercialRegister) === null || _b === void 0 ? void 0 : _b.file) && ((_c = commercialRegister === null || commercialRegister === void 0 ? void 0 : commercialRegister.file) === null || _c === void 0 ? void 0 : _c.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(commercialRegister.file.public_id);
                }
                if (((_d = data.commercialRegister) === null || _d === void 0 ? void 0 : _d.image) && ((_e = commercialRegister === null || commercialRegister === void 0 ? void 0 : commercialRegister.image) === null || _e === void 0 ? void 0 : _e.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(commercialRegister.image.public_id);
                }
            }
            if (data === null || data === void 0 ? void 0 : data.hajjReference) {
                if (((_f = data.hajjReference) === null || _f === void 0 ? void 0 : _f.file) && ((_g = hajjReference === null || hajjReference === void 0 ? void 0 : hajjReference.file) === null || _g === void 0 ? void 0 : _g.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(hajjReference.file.public_id);
                }
                if (((_h = data.hajjReference) === null || _h === void 0 ? void 0 : _h.image) && ((_j = hajjReference === null || hajjReference === void 0 ? void 0 : hajjReference.image) === null || _j === void 0 ? void 0 : _j.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(hajjReference.image.public_id);
                }
            }
            return updatedCampaign;
        });
    }
}
exports.campaignService = new CampaignService();
