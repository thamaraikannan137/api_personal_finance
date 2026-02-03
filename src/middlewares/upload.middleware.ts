import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, PDFs, and Word documents are allowed."));
  }
};

// Middleware for asset creation/update with files
const multerMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
}).fields([
  { name: "files", maxCount: 10 }, // Multiple files
]);

// Wrapper to handle multer errors properly
export const uploadAssetFiles = (req: Request, res: Response, next: NextFunction): void => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return next(err);
    }
    next();
  });
};

// Middleware to parse JSON payload from form data
export const parseAssetPayload = (req: Request, res: Response, next: NextFunction): void => {
  // If payload is sent as a JSON string in form data, parse it
  if (req.body.payload && typeof req.body.payload === "string") {
    try {
      const parsedPayload = JSON.parse(req.body.payload);
      req.body = { ...parsedPayload, ...req.body };
      delete req.body.payload;
    } catch (error) {
      return next(new Error("Invalid payload format"));
    }
  }
  next();
};
