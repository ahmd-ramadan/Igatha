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
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = exports.resendVerificationEmail = exports.verifyEmail = exports.register = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone } = validation_1.registerSchema.parse(req.body);
    const files = req.files;
    const userInfo = yield services_1.authService.register({ data: { name, email, password, phone }, files });
    res.status(utils_1.CREATED).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح ... توجه للإيميل لتأكيد الحساب',
        data: {
            user: userInfo.user,
            token: userInfo.token
        }
    });
});
exports.register = register;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = validation_1.verifyEmailSchema.parse(req.query);
    yield services_1.authService.verifyEmail(token);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تفعيل الإيميل بنجاح'
    });
});
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = validation_1.resendVerificationEmailSchema.parse(req.body);
    yield services_1.authService.resendVerificationEmail(email);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرسال إيميل التفعيل بنجاح'
    });
});
exports.resendVerificationEmail = resendVerificationEmail;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = validation_1.loginSchema.parse(req.body);
    const userInfo = yield services_1.authService.login({ email, password });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: {
            user: userInfo.data,
            token: userInfo.tokens.refreshToken
        }
    });
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new utils_1.ApiError('Unauthorized - No UserId', utils_1.UNAUTHORIZED);
    }
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        throw new utils_1.ApiError('Unauthorized - Invalid refreshtoken', utils_1.UNAUTHORIZED);
    }
    yield services_1.authService.logout(refreshToken);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
    });
});
exports.logout = logout;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new utils_1.ApiError('غير مصرح لك', utils_1.UNAUTHORIZED));
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(new utils_1.ApiError('غير مصرح لك ', utils_1.UNAUTHORIZED));
    }
    const tokens = yield services_1.authService.refreshAccessToken(token);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تفعيل التوكين بنجاح',
        tokens
    });
});
exports.refreshToken = refreshToken;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = validation_1.forgotPasswordSchema.parse(req.body);
    yield services_1.authService.generateOTP(email);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إرسال إيميل لإعادة تسجيل كلمة المرور بنجاح'
    });
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = validation_1.verifyOtpSchema.parse(req.body);
    yield services_1.authService.verifyOTP({ email, otp });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تأكيد OTP بنجاح'
    });
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, otp } = validation_1.resetPasswordSchema.parse(req.body);
    yield services_1.authService.resetPassword({ password, otp });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إعادة تعيين كلمة المرور بنجاح'
    });
});
exports.resetPassword = resetPassword;
