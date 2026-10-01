import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import crypto from "node:crypto";

// Stores uploaded cover images under public/uploads/<userId>/
// NOTE: destination reads req.user.id — must run after checkAuthentication
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve("public", "uploads", req.user.id.toString());

    mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${ext}`;

    cb(null, fileName);
  },
});

export const upload = multer({ storage });
