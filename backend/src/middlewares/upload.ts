import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { uploadsDir } from "../config/paths";
import { ApiError } from "../utils/ApiError";

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const extension = allowedTypes[file.mimetype];
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes[file.mimetype]) {
      cb(ApiError.badRequest("Only JPG, PNG and WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("image");
