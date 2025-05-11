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
exports.getAllUsers = exports.updateUserPassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userProfile = yield services_1.userService.isUserExist(userId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع بيانات المستخدم بنجاح',
        data: userProfile
    });
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = validation_1.updateUserProfileSchema.parse(req.body);
    const files = req.files;
    const updatedUser = yield services_1.userService.updateProfile({ userId, data, files });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث بيانات المستخدم بنجاح',
        data: updatedUser
    });
});
exports.updateUserProfile = updateUserProfile;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { oldPassword, newPassword } = validation_1.updateUserPasswordSchema.parse(req.body);
    yield services_1.userService.updatePassword({ userId, oldPassword, newPassword });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث كلمة المرور بنجاح',
    });
});
exports.updateUserPassword = updateUserPassword;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role } = validation_1.getAllUsersSchema.parse(req.query);
    const { size, page } = validation_1.paginationSchema.parse(req.query);
    const allUsers = yield services_1.userService.findAllUsers({ page, size, role });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرجاع جميع المستخدمين المطلوبين بنجاح',
        data: allUsers,
    });
});
exports.getAllUsers = getAllUsers;
