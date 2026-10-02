import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a buffer to Cloudinary via an upload_stream.
 * Avoids writing to local disk — ideal for serverless/ephemeral environments.
 * @param {Buffer} buffer - Image buffer from multer.memoryStorage().
 * @param {String} folder - Cloudinary folder path (e.g., "blogify/users/123").
 * @returns {Promise<Object>} Cloudinary upload result (secure_url, public_id, etc.).
 */
export const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,                  // Organizes uploads under this folder
        resource_type: "image",  // Optimizes delivery for images
        quality: "auto:best",    // Preserve near-original visual quality
        fetch_format: "auto",    // Deliver WebP/AVIF when browser supports it
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(buffer); // Write buffer to the upload stream
  });