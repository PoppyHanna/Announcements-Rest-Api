import { randomUUID } from "node:crypto";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";

const uploadDir = path.resolve("uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },

  filename: (_req, file, callback) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;

    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPEG, PNG and WEBP images are allowed"),
      );
    }

    callback(null, true);
  },
});

export default upload;
