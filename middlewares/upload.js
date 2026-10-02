import multer from "multer";

// Configure multer for Cloudinary uploads.
// Uses memoryStorage (buffer) instead of disk — files are streamed directly
// to Cloudinary via upload_stream in services/uploadToCloudinary.js.
// No local disk persistence needed; works on ephemeral filesystems (Render, etc.).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only image MIME types (jpeg, png, webp, gif, avif, etc.)
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  },
});
