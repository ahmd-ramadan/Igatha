"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerMiddleHost = exports.allowedExtensions = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
exports.allowedExtensions = {
    image: ["jpg", "jpeg", "png", "gif", "jfif", "webp"],
    video: ["mp4", "avi", "mkv"],
    audio: ["mp3", "wav"],
    // document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
    document: ["pdf"],
    code: ["js", "jsx", "ts", "tsx", "html", "css", "scss", "json", "xml"],
    compressed: ["zip", "rar", "7z"],
};
const multerMiddleHost = ({ extensions = [...exports.allowedExtensions.image, ...exports.allowedExtensions.document] }) => {
    //! diskStorage
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const destinationPath = path_1.default.join(__dirname, "..", "uploads", "temp", "files");
            if (!fs_1.default.existsSync(destinationPath)) {
                fs_1.default.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
            const uniqueFileName = (0, utils_1.generateUniqueString)({ length: 6 }) + "_" + file.originalname;
            cb(null, uniqueFileName);
        },
    });
    const fileFilter = (req, file, cb) => {
        const fileType = file.mimetype.split("/")[1];
        const isImage = file.mimetype.startsWith('image/');
        const isPDF = file.mimetype === 'application/pdf';
        // Check if the field name matches the expected file type
        if (file.fieldname.endsWith('Image') && !isImage) {
            return cb(new utils_1.ApiError(`Field ${file.fieldname} must be an image file`, utils_1.BAD_REQUEST));
        }
        if (file.fieldname.endsWith('File') && !isPDF) {
            return cb(new utils_1.ApiError(`Field ${file.fieldname} must be a PDF file`, utils_1.BAD_REQUEST));
        }
        if (extensions.includes(fileType)) {
            return cb(null, true);
        }
        cb(new utils_1.ApiError(`File format is not allowed! For ${file.fieldname}, only ${file.fieldname.endsWith('Image') ? 'images' : 'PDFs'} are accepted.`, utils_1.BAD_REQUEST));
    };
    const file = (0, multer_1.default)({ fileFilter, storage });
    return file;
};
exports.multerMiddleHost = multerMiddleHost;
