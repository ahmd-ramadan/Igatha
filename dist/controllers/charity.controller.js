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
exports.updateCharityProfile = exports.charityRegister = void 0;
const validation_1 = require("../validation");
const services_1 = require("../services");
const utils_1 = require("../utils");
const charityRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = validation_1.createCharitySchema.parse(req.body);
    const files = req.files;
    const { charity, token } = yield services_1.charityService.createCharity({ data, files });
    res.status(utils_1.CREATED).json({
        success: true,
        message: 'تم إنشاء حساب الجمعية الخيرية بنجاح .. تم إرسال طلب الإنضمام إلي الأدمن للمراجعة',
        data: {
            charity,
            token
        }
    });
});
exports.charityRegister = charityRegister;
const updateCharityProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('req.body', req.body);
    const charityId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = validation_1.updateCharitySchema.parse(req.body);
    const files = req.files;
    console.log('files', files);
    const { request, charity } = yield services_1.charityService.updateCharity({ charityId, data, files });
    res.status(utils_1.OK).json({
        success: true,
        message: request ? 'تم إرسال بعض البيانات للإدارة للمراجعة' : 'تم تحديث بياناتك بنجاح',
        data: {
            request,
            charity
        }
    });
});
exports.updateCharityProfile = updateCharityProfile;
