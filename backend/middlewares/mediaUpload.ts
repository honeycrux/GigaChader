import { ErrorRequestHandler } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const tobyte = (sizeInMegabyte: number) => sizeInMegabyte * 1000000;

/* Route-level middlewares for avatar upload */

const profileUploadMulter = multer({
    storage: storage,
    limits: {
        fileSize: tobyte(5),
    },
    fileFilter: (req, file, callback) => {
        const mimetype = file.mimetype.split("/");
        if (mimetype[0] === "image") {
            callback(null, true);
        } else {
            callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
        }
    },
});

export const profileUploadMiddleware = profileUploadMulter.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]);
export type ProfileUploadFiles = {
    avatar: Express.Multer.File[];
    banner: Express.Multer.File[];
};

/* Route-level middlewares for media upload */

const mediaUploadMulter = multer({
    storage: storage,
    limits: {
        fileSize: tobyte(64),
    },
    fileFilter: (req, file, callback) => {
        const mimetype = file.mimetype.split("/");
        if (mimetype[0] === "image" || mimetype[0] === "video") {
            callback(null, true);
        } else {
            callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
        }
    },
});

export const mediaUploadMiddleware = mediaUploadMulter.fields([{ name: "media", maxCount: 10 }]);
export type MediaUploadFiles = {
    media: Express.Multer.File[];
};

/* App-level error-handling middleware */

export const uploadErrorHandler: ErrorRequestHandler = function (err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "File size exceeds the allowed limit.",
            });
        } else if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                error: "Exceeded the maximum number of files allowed.",
            });
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                error: "File must be an image.",
            });
        } else {
            return res.status(400).json({
                error: "Unknown multer error.",
            });
        }
    } else {
        return next();
    }
};
