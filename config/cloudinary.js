import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary SDK configuration.
 * Reads credentials from the CLOUDINARY_URL environment variable
 * (single connection string format):
 *   cloudinary://<api_key>:<api_secret>@<cloud_name>
 * The SDK auto-detects it from process.env.
 * `secure: true` forces HTTPS delivery URLs.
 */
cloudinary.config({
  secure: true,
});

export default cloudinary;