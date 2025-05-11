import multer, { StorageEngine, FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { ApiError, BAD_REQUEST, generateUniqueString } from "../utils";
import { Request, Express } from "express";

export const allowedExtensions: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif", "jfif", "webp"],
    video: ["mp4", "avi", "mkv"],
    audio: ["mp3", "wav"],
    // document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
    document: ["pdf"],
    code: ["js", "jsx", "ts", "tsx", "html", "css", "scss", "json", "xml"],
    compressed: ["zip", "rar", "7z"],
};

interface MulterOptions {
    extensions?: string[];
}

export const multerMiddleHost = ({ extensions = [...allowedExtensions.image, ...allowedExtensions.document ] }: MulterOptions) => {
    //! diskStorage
    const storage: StorageEngine = multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            const destinationPath = path.join(__dirname, "..", "uploads", "temp", "files");
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },

        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            const uniqueFileName = generateUniqueString({ length: 6 }) + "_" + file.originalname;
            cb(null, uniqueFileName);
        },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const fileType = file.mimetype.split("/")[1];
        const isImage = file.mimetype.startsWith('image/');
        const isPDF = file.mimetype === 'application/pdf';

        // Check if the field name matches the expected file type
        if (file.fieldname.endsWith('Image') && !isImage) {
            return cb(new ApiError(`Field ${file.fieldname} must be an image file`, BAD_REQUEST));
        }
        if (file.fieldname.endsWith('File') && !isPDF) {
            return cb(new ApiError(`Field ${file.fieldname} must be a PDF file`, BAD_REQUEST));
        }

        if (extensions.includes(fileType)) {
            return cb(null, true);
        }
        cb(new ApiError(`File format is not allowed! For ${file.fieldname}, only ${file.fieldname.endsWith('Image') ? 'images' : 'PDFs'} are accepted.`, BAD_REQUEST));
    };

    const file = multer({ fileFilter, storage });
    return file;
};
