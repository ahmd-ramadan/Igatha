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
exports.authService = void 0;
const utils_1 = require("../utils");
const hashing_service_1 = require("./hashing.service");
const user_service_1 = require("./user.service");
const email_service_1 = require("./email.service");
const jwt_service_1 = require("./jwt.service");
const token_service_1 = require("./token.service");
const token_enums_1 = require("../enums/token.enums");
const otp_service_1 = require("./otp.service");
const cloudinary_service_1 = require("./cloudinary.service");
const config_1 = require("../config");
class AuthService {
    register(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data: { name, email, password, phone }, files }) {
            try {
                const userExists = yield user_service_1.userService.findUserByEmail(email);
                if (userExists) {
                    throw new utils_1.ApiError('المستخدم موجود بالفعل', utils_1.CONFLICT);
                }
                const hashedPassword = yield hashing_service_1.HashingService.hash(password);
                const userCredentials = { name, email, password: hashedPassword, phone };
                if (files && files.length) {
                    const { secure_url, public_id } = yield cloudinary_service_1.cloudinaryService.uploadImage({
                        fileToUpload: files.avatar[0].path,
                        folderPath: config_1.cloudinaryAvatarsFolder
                    });
                    userCredentials.avatar = { secure_url, public_id };
                }
                const user = yield this.createNewUser(userCredentials);
                const token = (yield this.generateAndStoreTokens(user)).refreshToken;
                yield this.sendVerificationEmail(user);
                return {
                    user,
                    token
                };
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية إنشاء الحساب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    generateAndStoreTokens(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id: userId, role, status } = user;
            const tokens = jwt_service_1.JwtService.generateTokens(user);
            yield token_service_1.tokenService.createOne({
                token: tokens.refreshToken,
                userId,
                expiresAt: new Date(Date.now() + utils_1.MAGIC_NUMBERS.ONE_WEEK_IN_MILLISECONDS),
            });
            return tokens;
        });
    }
    createNewUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_service_1.userService.createNewUser(data);
        });
    }
    sendVerificationEmail(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id: userId, role, status } = user;
            const verificationToken = jwt_service_1.JwtService.generateAccessToken({ userId, role, status }, 24 * 60 * 60);
            yield token_service_1.tokenService.createOne({
                userId,
                token: verificationToken,
                expiresAt: new Date(Date.now() + utils_1.MAGIC_NUMBERS.ONE_DAY_IN_MILLISECONDS),
                type: token_enums_1.TokenTypesEnum.ACTIVATION
            });
            email_service_1.emailService.sendVerificationEmail({
                email: user.email,
                name: user.name,
                token: verificationToken,
            });
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jwt_service_1.JwtService.verify(token, 'access');
                if (!decoded) {
                    throw new utils_1.ApiError('التوكين غير صحيح', utils_1.UNAUTHORIZED);
                }
                const user = yield user_service_1.userService.findUserById(decoded.userId);
                if (!user) {
                    throw new utils_1.ApiError('المستخدم غير موجود', utils_1.NOT_FOUND);
                }
                const storedActivationToken = yield token_service_1.tokenService.findOne({
                    userId: user === null || user === void 0 ? void 0 : user._id,
                    token: token,
                    type: token_enums_1.TokenTypesEnum.ACTIVATION,
                    expiresAt: { $gt: new Date() }
                });
                if (!storedActivationToken) {
                    throw new utils_1.ApiError('توكين التفعيل غير صحيح او منتهي الصلاحية', utils_1.GONE);
                }
                yield Promise.all([
                    user_service_1.userService.updateOne({ userId: user._id, role: user.role, data: { isVerified: true } }),
                    token_service_1.tokenService.deleteOne({ _id: storedActivationToken._id })
                ]);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية تفعيل الحساب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    resendVerificationEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_service_1.userService.findUserByEmail(email);
                if (!user) {
                    throw new utils_1.ApiError('المستخدم غير موجود', utils_1.NOT_FOUND);
                }
                if (user.isVerified) {
                    throw new utils_1.ApiError('الإيميل مَفعل بالفعل', utils_1.CONFLICT);
                }
                const isTokenExists = yield token_service_1.tokenService.findOne({ userId: user === null || user === void 0 ? void 0 : user._id, type: token_enums_1.TokenTypesEnum.ACTIVATION });
                if (isTokenExists) {
                    yield token_service_1.tokenService.deleteOne({ _id: isTokenExists._id });
                }
                const userResponse = user;
                yield this.sendVerificationEmail(user);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية إرسال إيميل لتفعيل الحساب', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    login(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password }) {
            try {
                const user = yield user_service_1.userService.findUserByEmail(email);
                if (!user || !user.password) {
                    throw new utils_1.ApiError('البريد الإلكتروني أو كلمة المرور غير صحيحة', utils_1.BAD_REQUEST);
                }
                const passwordMatches = yield hashing_service_1.HashingService.compare(password, user === null || user === void 0 ? void 0 : user.password);
                if (!passwordMatches) {
                    throw new utils_1.ApiError('البريد الإلكتروني أو كلمة المرور غير صحيحة', utils_1.BAD_REQUEST);
                }
                if (!user.isVerified) {
                    throw new utils_1.ApiError(' الحساب غير مَفعل. من فضلك افحص إيميلك', utils_1.FORBIDDEN);
                }
                const tokens = yield this.generateAndStoreTokens(user);
                const userResponse = user;
                return { data: userResponse, tokens };
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية تسجيل الدخول', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const storedToken = yield token_service_1.tokenService.tokenExists(refreshToken);
                if (!storedToken) {
                    throw new utils_1.ApiError('غير مَصرح لك', utils_1.UNAUTHORIZED);
                }
                yield token_service_1.tokenService.deleteOne({ token: refreshToken });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية تسجيل الخروج', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jwt_service_1.JwtService.verify(refreshToken, 'refresh');
                if (!payload) {
                    throw new utils_1.ApiError('غير مَصرح لك', utils_1.UNAUTHORIZED);
                }
                const user = yield user_service_1.userService.findUserById(payload.userId);
                const storedToken = yield token_service_1.tokenService.tokenExists(refreshToken);
                if (!user || !storedToken) {
                    throw new utils_1.ApiError('غير مضرح لك', utils_1.UNAUTHORIZED);
                }
                // await tokenService.deleteOne({ token: refreshToken });
                // return await this.generateAndStoreTokens(payload.id as string);
                return jwt_service_1.JwtService.generateAccessToken(payload);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية إعادة تفعيل التوكين', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    generateOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_service_1.userService.findUserByEmail(email);
                if (user) {
                    const otp = (0, utils_1.generateCode)();
                    yield this.storeAndSendOTP({ user, otp });
                }
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية إنشاء OTP', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    storeAndSendOTP(_a) {
        return __awaiter(this, arguments, void 0, function* ({ user, otp }) {
            yield Promise.all([
                otp_service_1.otpService.createOne({
                    otp,
                    userId: user._id,
                    expiresAt: new Date(Date.now() + utils_1.MAGIC_NUMBERS.FIFTEEN_MINUTES_IN_MILLISECONDS),
                })
            ]);
            email_service_1.emailService.sendForgetPasswordEmail({ email: user.email, name: user.name, otp: otp });
        });
    }
    verifyOTP(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, otp }) {
            try {
                const user = yield user_service_1.userService.findUserByEmail(email);
                if (!user) {
                    throw new utils_1.ApiError('المستخدم غير موجود', utils_1.NOT_FOUND);
                }
                const storedOTP = yield otp_service_1.otpService.findOne({ otp, userId: user._id, expiresAt: { $gt: new Date() } });
                if (!storedOTP || storedOTP.otp.toString().trim() !== otp.toString().trim()) {
                    throw new utils_1.ApiError('OTP غير صحيح أو منتهي الصلاحية', utils_1.GONE);
                }
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية تأكيد الOTP', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    resetPassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ password, otp }) {
            try {
                const otpExist = yield otp_service_1.otpService.findOne({ otp, expiresAt: { $gt: new Date() } });
                if (!otpExist) {
                    throw new utils_1.ApiError('OTP غير صحيح أو منتهي الصلاحية', utils_1.GONE);
                }
                const { userId } = otpExist;
                const userExist = yield user_service_1.userService.findUserById(userId);
                if (!userExist) {
                    throw new utils_1.ApiError('المستخدم غير موجود', utils_1.NOT_FOUND);
                }
                const hashedPassword = yield hashing_service_1.HashingService.hash(password);
                yield Promise.all([
                    otp_service_1.otpService.deleteOne({ otp, userId }),
                    user_service_1.userService.updateOne({ userId, role: userExist.role, data: { password: hashedPassword } }),
                    token_service_1.tokenService.deleteMany({ userId }),
                ]);
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('فشل عملية إعادة تعيين كلمة المرور', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.authService = new AuthService();
