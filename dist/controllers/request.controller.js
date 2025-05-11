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
exports.updateRequest = exports.deleteRequest = exports.rejectOnRequest = exports.approveOnRequest = exports.getAllRequests = void 0;
const utils_1 = require("../utils");
const services_1 = require("../services");
const validation_1 = require("../validation");
const enums_1 = require("../enums");
const getAllRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const role = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.role;
    let query = validation_1.getAllRequestsSchema.parse(req.query);
    const { size, page } = validation_1.paginationSchema.parse(req.query);
    //! To prevent any user see any users requests
    if (role !== enums_1.UserRolesEnum.ADMIN) {
        query.userId = userId;
    }
    const allRequests = yield services_1.requestService.getAllRequests(Object.assign(Object.assign({}, query), { size, page }));
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع كل طلبات المستخدمين بنجاح',
        data: allRequests
    });
});
exports.getAllRequests = getAllRequests;
const approveOnRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: requestId } = validation_1.paramsSchema.parse(req.params);
    const campaign = yield services_1.requestService.approveOnRequest(requestId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم الموافقة علي الطلب بنجاح',
        data: campaign
    });
});
exports.approveOnRequest = approveOnRequest;
const rejectOnRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: requestId } = validation_1.paramsSchema.parse(req.params);
    const { rejectionReason } = validation_1.rejectOnRequestSchema.parse(req.body);
    const request = yield services_1.requestService.rejectOnRequest(requestId, rejectionReason);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم رفض علي الطلب بنجاح',
        data: request
    });
});
exports.rejectOnRequest = rejectOnRequest;
const deleteRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { _id: requestId } = validation_1.paramsSchema.parse(req.params);
    const request = yield services_1.requestService.deleteRequest({ requestId, userId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم حذف الطلب بنجاح',
        data: request
    });
});
exports.deleteRequest = deleteRequest;
const updateRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { _id: requestId } = validation_1.paramsSchema.parse(req.params);
    const data = validation_1.updateRequestSchema.parse(req.body);
    const request = yield services_1.requestService.updateRequest({ requestId, userId, data });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث طلبك بنجاح',
        data: request
    });
});
exports.updateRequest = updateRequest;
