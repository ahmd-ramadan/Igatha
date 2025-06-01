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
exports.supplierService = void 0;
const config_1 = require("../config");
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const auth_service_1 = require("./auth.service");
const cloudinary_service_1 = require("./cloudinary.service");
const hashing_service_1 = require("./hashing.service");
const product_service_1 = require("./product.service");
const request_service_1 = require("./request.service");
const user_service_1 = require("./user.service");
class SupplierService {
    constructor(supplierDataSource = repositories_1.supplierRepository) {
        this.supplierDataSource = supplierDataSource;
    }
    isSupplierExist(supplierId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isSupplierExist = yield this.supplierDataSource.findById(supplierId);
            if (!isSupplierExist) {
                throw new utils_1.ApiError('المورد غير موجود', utils_1.NOT_FOUND);
            }
            return isSupplierExist;
        });
    }
    createSupplier(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, files }) {
            try {
                const { email, password } = data;
                const isSupplierExist = yield user_service_1.userService.isUserExistByEmail({
                    email,
                    role: enums_1.UserRolesEnum.SUPPLIER
                });
                if (isSupplierExist) {
                    throw new utils_1.ApiError('هذا البريد الإلكتروني مستخدم بالفعل', utils_1.CONFLICT);
                }
                let newData = Object.assign(Object.assign({}, data), { password: yield hashing_service_1.HashingService.hash(password), commercialRegister: {}, workPermit: {} });
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
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        newData.commercialRegister = Object.assign(Object.assign({}, newData.commercialRegister), { file: commercialRegisterFile });
                    }
                    if (files.commercialRegisterImage) {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        newData.commercialRegister = Object.assign(Object.assign({}, newData.commercialRegister), { image: commercialRegisterImage });
                    }
                    if (!files.workPermitImage && !files.workPermitFile) {
                        throw new utils_1.ApiError('يجب عليك رفع صورة أو ملف تصريح العمل', utils_1.BAD_REQUEST);
                    }
                    if (files.workPermitFile) {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        newData.workPermit = Object.assign(Object.assign({}, newData.workPermit), { file: workPermitFile });
                    }
                    if (files.workPermitImage) {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        newData.workPermit = Object.assign(Object.assign({}, newData.workPermit), { image: workPermitImage });
                    }
                }
                console.log(newData);
                const supplier = yield this.supplierDataSource.createOne(newData);
                const token = (yield auth_service_1.authService.generateAndStoreTokens(supplier)).refreshToken;
                yield auth_service_1.authService.sendVerificationEmail(supplier);
                yield request_service_1.requestService.createRequest({
                    userId: supplier._id,
                    role: enums_1.UserRolesEnum.SUPPLIER,
                    currentData: supplier,
                    requestedData: newData,
                    type: enums_1.RequestTypeEnum.NEW
                });
                //! notification to the admin with new supplier
                //! notification to the supplier with welcome message
                return {
                    supplier,
                    token
                };
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ ما اثناء إنشاء المورد', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateSupplier(_a) {
        return __awaiter(this, arguments, void 0, function* ({ supplierId, data, files }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k;
            try {
                console.log("files", files);
                //! Have request Update 
                const requestIsExist = yield request_service_1.requestService.findRequest({ userId: supplierId, role: enums_1.UserRolesEnum.SUPPLIER, type: enums_1.RequestTypeEnum.UPDATE });
                const currentSupplier = yield this.isSupplierExist(supplierId);
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
                    const isSupplierHaveCommercialRegisterFile = ((_c = (_b = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _b === void 0 ? void 0 : _b.commercialRegister) === null || _c === void 0 ? void 0 : _c.file) || undefined;
                    if (isSupplierHaveCommercialRegisterFile) {
                        const commercialRegisteFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isSupplierHaveCommercialRegisterFile.public_id,
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { file: commercialRegisteFile });
                    }
                    else {
                        const commercialRegisterFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterFile[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { file: commercialRegisterFile });
                    }
                }
                if (files.commercialRegisterImage) {
                    const isSupplierHaveCommercialRegisterImage = ((_e = (_d = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _d === void 0 ? void 0 : _d.commercialRegister) === null || _e === void 0 ? void 0 : _e.image) || undefined;
                    if (isSupplierHaveCommercialRegisterImage) {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isSupplierHaveCommercialRegisterImage.public_id,
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { image: commercialRegisterImage });
                    }
                    else {
                        const commercialRegisterImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.commercialRegisterImage[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.commercialRegister = Object.assign(Object.assign({}, requestedUpdatedData.commercialRegister), { image: commercialRegisterImage });
                    }
                }
                if (files.workPermitFile) {
                    const isSupplierHaveWorkPermitFile = ((_g = (_f = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _f === void 0 ? void 0 : _f.workPermit) === null || _g === void 0 ? void 0 : _g.file) || undefined;
                    if (isSupplierHaveWorkPermitFile) {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isSupplierHaveWorkPermitFile.public_id,
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { file: workPermitFile });
                    }
                    else {
                        const workPermitFile = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitFile[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { file: workPermitFile });
                    }
                }
                if (files.workPermitImage) {
                    const isSupplierHaveWorkPermitImage = ((_j = (_h = requestIsExist === null || requestIsExist === void 0 ? void 0 : requestIsExist.requestedData) === null || _h === void 0 ? void 0 : _h.workPermit) === null || _j === void 0 ? void 0 : _j.image) || undefined;
                    if (isSupplierHaveWorkPermitImage) {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                            oldPublicId: isSupplierHaveWorkPermitImage.public_id,
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { image: workPermitImage });
                    }
                    else {
                        const workPermitImage = yield cloudinary_service_1.cloudinaryService.uploadImage({
                            fileToUpload: files.workPermitImage[0].path,
                            folderPath: config_1.cloudinarySuppliersFolder
                        });
                        requestedUpdatedData.workPermit = Object.assign(Object.assign({}, requestedUpdatedData.workPermit), { image: workPermitImage });
                    }
                    console.log(files.workPermitImage[0], isSupplierHaveWorkPermitImage);
                }
                // Update supplier data
                const updatedSupplier = yield this.supplierDataSource.updateOne({ _id: supplierId }, updatedData);
                if (updatedData.avatar && ((_k = currentSupplier === null || currentSupplier === void 0 ? void 0 : currentSupplier.avatar) === null || _k === void 0 ? void 0 : _k.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(currentSupplier.avatar.public_id);
                }
                // Create update request instead of directly updating
                let request = requestIsExist || null;
                if (Object.keys(requestedUpdatedData).length > 0) {
                    if (requestIsExist) {
                        requestIsExist.requestedData = requestedUpdatedData;
                        request = yield request_service_1.requestService.updateRequest({ requestId: requestIsExist._id, userId: supplierId, data: requestedUpdatedData });
                    }
                    else {
                        request = yield request_service_1.requestService.createRequest({
                            userId: supplierId,
                            role: enums_1.UserRolesEnum.SUPPLIER,
                            currentData: currentSupplier,
                            requestedData: requestedUpdatedData,
                            type: enums_1.RequestTypeEnum.UPDATE
                        });
                    }
                }
                return {
                    request,
                    supplier: updatedSupplier
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
        return __awaiter(this, arguments, void 0, function* ({ supplierId, data }) {
            var _b, _c, _d, _e, _f, _g, _h, _j;
            const { commercialRegister, workPermit } = yield this.isSupplierExist(supplierId);
            const updatedSupplier = yield this.supplierDataSource.updateOne({ _id: supplierId }, data);
            //! Delete cloudinary previous images
            if (data === null || data === void 0 ? void 0 : data.commercialRegister) {
                if (((_b = data.commercialRegister) === null || _b === void 0 ? void 0 : _b.file) && ((_c = commercialRegister === null || commercialRegister === void 0 ? void 0 : commercialRegister.file) === null || _c === void 0 ? void 0 : _c.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(commercialRegister.file.public_id);
                }
                if (((_d = data.commercialRegister) === null || _d === void 0 ? void 0 : _d.image) && ((_e = commercialRegister === null || commercialRegister === void 0 ? void 0 : commercialRegister.image) === null || _e === void 0 ? void 0 : _e.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(commercialRegister.image.public_id);
                }
            }
            if (data === null || data === void 0 ? void 0 : data.workPermit) {
                if (((_f = data.workPermit) === null || _f === void 0 ? void 0 : _f.file) && ((_g = workPermit === null || workPermit === void 0 ? void 0 : workPermit.file) === null || _g === void 0 ? void 0 : _g.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(workPermit.file.public_id);
                }
                if (((_h = data.workPermit) === null || _h === void 0 ? void 0 : _h.image) && ((_j = workPermit === null || workPermit === void 0 ? void 0 : workPermit.image) === null || _j === void 0 ? void 0 : _j.public_id)) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(workPermit.image.public_id);
                }
            }
            //! Updated All Product isActive
            const updatedSupplierProducts = yield product_service_1.productService.updateMany({
                query: { supplierId },
                data: { isActive: true }
            });
            return updatedSupplier;
        });
    }
}
exports.supplierService = new SupplierService();
