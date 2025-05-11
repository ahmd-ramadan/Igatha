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
exports.requestService = void 0;
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const cloudinary_service_1 = require("./cloudinary.service");
const user_service_1 = require("./user.service");
class RequestService {
    constructor(requestDataSource = repositories_1.requestRepository) {
        this.requestDataSource = requestDataSource;
    }
    isRequestExist(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRequestExist = yield this.requestDataSource.findById(requestId);
            if (!isRequestExist) {
                throw new utils_1.ApiError('لا يوجد طلب مطابق لهذا المعرف', utils_1.NOT_FOUND);
            }
            return isRequestExist;
        });
    }
    findRequest(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestDataSource.findOne(query);
        });
    }
    createRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestExist = yield this.findRequest({ userId: request.userId, status: enums_1.RequestStatusEnum.PENDING });
                if (requestExist) {
                    if (requestExist.type === enums_1.RequestTypeEnum.UPDATE) {
                        throw new utils_1.ApiError('لم يتم الموافقة علي طلب التحديث بعد ..  لا يمكن إنشاء طلب حالي لهذا المستخدم ', utils_1.CONFLICT);
                    }
                    if (requestExist.type === enums_1.RequestTypeEnum.NEW) {
                        throw new utils_1.ApiError('لم يتم الموافقة علي طلب الإنشاء بعد ..  لا يمكن إنشاء طلب حالي لهذا المستخدم ', utils_1.CONFLICT);
                    }
                }
                return yield this.requestDataSource.createOne(request);
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء إنشاء الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ requestId, userId, data }) {
            try {
                const request = yield this.isRequestExist(requestId);
                if (request.userId.toString() !== userId.toString()) {
                    throw new utils_1.ApiError('لا يمكن تحديث هذا الطلب', utils_1.CONFLICT);
                }
                if (request.status === enums_1.RequestStatusEnum.APPROVED) {
                    throw new utils_1.ApiError('لقد تمت الموافقة علي هذا الطلب بالفعل .. لا يمكن تحديثه', utils_1.CONFLICT);
                }
                return yield this.requestDataSource.updateOne({ _id: requestId }, { requestedData: Object.assign(Object.assign({}, request.requestedData), data), status: enums_1.RequestStatusEnum.PENDING });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء تحديث الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllRequests(_a) {
        return __awaiter(this, arguments, void 0, function* ({ role, userId, status, type, size, page }) {
            try {
                let query = {};
                if (role)
                    query.role = role;
                if (status)
                    query.status = status;
                if (userId)
                    query.userId = userId;
                if (type)
                    query.type = type;
                const { skip, limit } = (0, utils_1.pagination)({ page, size });
                return yield this.requestDataSource.find(query, { skip, limit });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء جلب الطلبات', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ requestId, userId }) {
            try {
                const request = yield this.isRequestExist(requestId);
                if (request.userId.toString() !== userId.toString()) {
                    throw new utils_1.ApiError('لا يمكن تحديث هذا الطلب', utils_1.CONFLICT);
                }
                const deletedRequest = yield this.requestDataSource.deleteOne({ _id: requestId });
                const ok = this.delteRequestImages(request.requestedData);
                return deletedRequest;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء حذف الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    approveOnRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.isRequestExist(requestId);
                if (request.status === enums_1.RequestStatusEnum.APPROVED) {
                    throw new utils_1.ApiError('لقد تمت الموافقة علي هذا الطلب بالفعل', utils_1.CONFLICT);
                }
                const updatedUser = yield user_service_1.userService.updateOne({
                    userId: request.userId,
                    role: request.role,
                    data: Object.assign(Object.assign({}, request.requestedData), { status: enums_1.UserStatusEnum.APPROVED }),
                });
                // const updatedRequet = await this.requestDataSource.updateOne({ _id: requestId }, { status: RequestStatusEnum.APPROVED }) as IRequest
                const deletedRequest = yield this.requestDataSource.deleteOne({ _id: requestId });
                //! Send notification/email to the user with approved request
                return updatedUser;
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء الموافقة على الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    rejectOnRequest(requestId, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.isRequestExist(requestId);
                if (request.status === enums_1.RequestStatusEnum.APPROVED) {
                    throw new utils_1.ApiError('لقد تمت الموافقة علي هذا الطلب بالفعل .. لا يمكن رفضه', utils_1.CONFLICT);
                }
                yield user_service_1.userService.updateOne({
                    userId: request.userId,
                    role: request.role,
                    data: {
                        status: enums_1.UserStatusEnum.REJECTED,
                        rejectionReason: request.type === enums_1.RequestTypeEnum.UPDATE ? "" : rejectionReason
                    },
                });
                const updatedRequet = yield this.requestDataSource.updateOne({ _id: requestId }, { status: enums_1.RequestStatusEnum.REJECTED, rejectionReason });
                //! Send notification/email to the user with rejected request 
                return updatedRequet;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError)
                    throw error;
                throw new utils_1.ApiError('حدث خطأ أثناء رفض الطلب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    delteRequestImages(requestedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (requestedData.commercialRegister) {
                if (requestedData.commercialRegister.file) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(requestedData.commercialRegister.file.public_id);
                }
                if (requestedData.commercialRegister.image) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(requestedData.commercialRegister.image.public_id);
                }
            }
            if (requestedData.hajjReference) {
                if (requestedData.hajjReference.file) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(requestedData.hajjReference.file.public_id);
                }
                if (requestedData.hajjReference.image) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(requestedData.hajjReference.image.public_id);
                }
            }
            if (requestedData.workPermit) {
                if (requestedData.workPermit.file) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(requestedData.workPermit.file.public_id);
                }
                if (requestedData.workPermit.image) {
                    yield cloudinary_service_1.cloudinaryService.deleteImage(requestedData.workPermit.image.public_id);
                }
            }
        });
    }
}
exports.requestService = new RequestService();
