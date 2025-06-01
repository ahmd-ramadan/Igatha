"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryMealsFolder = exports.cloudinaryProductsFolder = exports.cloudinaryCharitiesFolder = exports.cloudinarySuppliersFolder = exports.cloudinaryKitchensFolder = exports.cloudinaryCampaignsFolder = exports.cloudinaryAvatarsFolder = exports.cloudinaryApiSecret = exports.cloudinaryApiKey = exports.cloudinaryCloudName = void 0;
const env_1 = __importDefault(require("./env"));
exports.cloudinaryCloudName = (0, env_1.default)('CLOUDINARY_CLOUD_NAME');
exports.cloudinaryApiKey = (0, env_1.default)('CLOUDINARY_API_KEY');
exports.cloudinaryApiSecret = (0, env_1.default)('CLOUDINARY_API_SECRET');
exports.cloudinaryAvatarsFolder = (0, env_1.default)('CLOUDINARY_AVATARS_FOLDER');
exports.cloudinaryCampaignsFolder = (0, env_1.default)('CLOUDINARY_CAMPAIGNS_FOLDER');
exports.cloudinaryKitchensFolder = (0, env_1.default)('CLOUDINARY_KITCHENS_FOLDER');
exports.cloudinarySuppliersFolder = (0, env_1.default)('CLOUDINARY_SUPPLIERS_FOLDER');
exports.cloudinaryCharitiesFolder = (0, env_1.default)('CLOUDINARY_CHARITIES_FOLDER');
exports.cloudinaryProductsFolder = (0, env_1.default)('CLOUDINARY_PRODUCTS_FOLDER');
exports.cloudinaryMealsFolder = (0, env_1.default)('CLOUDINARY_MEALS_FOLDER');
