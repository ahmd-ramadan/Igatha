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
exports.cloudinaryService = exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = require("fs");
const config_1 = require("../config");
const utils_1 = require("../utils");
class CloudinaryService {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: config_1.cloudinaryCloudName,
            api_key: config_1.cloudinaryApiKey,
            api_secret: config_1.cloudinaryApiSecret,
        });
    }
    uploadImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fileToUpload, folderPath }) {
            try {
                const { secure_url, public_id } = yield cloudinary_1.v2.uploader.upload(fileToUpload, {
                    folder: folderPath,
                });
                if (!secure_url || !public_id) {
                    throw new utils_1.ApiError('فشل في تحميل الصورة', utils_1.BAD_REQUEST);
                }
                return { secure_url, public_id };
            }
            catch (err) {
                console.error(err);
                throw new utils_1.ApiError('شئ ما خطأ أثناء تحميل الصور', utils_1.INTERNAL_SERVER_ERROR);
            }
            finally {
                (0, fs_1.unlinkSync)(fileToUpload);
            }
        });
    }
    deleteImage(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.v2.uploader.destroy(publicId);
                if (result.result !== 'ok' && result.result !== 'not found') {
                    throw new utils_1.ApiError('فشل في حذف الصورة', utils_1.BAD_REQUEST);
                }
                return true;
            }
            catch (err) {
                console.error(err);
                throw new utils_1.ApiError('شئ ما خطأ أثناء حذف الصور', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ oldPublicId, fileToUpload, folderPath, }) {
            try {
                // Delete the old image
                yield this.deleteImage(oldPublicId);
                // Upload the new image
                return yield this.uploadImage({ fileToUpload, folderPath });
            }
            catch (err) {
                console.error(err);
                throw new utils_1.ApiError('شئ ما خطأ أثناء تحديث الصورة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.CloudinaryService = CloudinaryService;
exports.cloudinaryService = new CloudinaryService();
