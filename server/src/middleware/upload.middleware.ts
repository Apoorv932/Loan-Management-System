import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { HttpError } from "../utils/httpError.js";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

const storage = multer.memoryStorage();

export const salarySlipUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new HttpError(400, "Salary slip must be a PDF, JPG, or PNG file.") as unknown as null, false);
    }
    callback(null, true);
  }
});

export const uploadToCloudinary = (fileBuffer: Buffer, folderName: string): Promise<string> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isCloudinaryConfigured =
    cloudName &&
    cloudName !== "your_cloud_name" &&
    apiKey &&
    apiKey !== "your_api_key" &&
    apiSecret &&
    apiSecret !== "your_api_secret";

  if (!isCloudinaryConfigured) {
    // Local upload fallback
    return new Promise((resolve, reject) => {
      try {
        const uploadDir = path.resolve("uploads", folderName);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Detect file extension from buffer magic bytes
        let ext = ".png";
        if (fileBuffer.length >= 4) {
          if (fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46) {
            ext = ".pdf";
          } else if (fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8) {
            ext = ".jpg";
          } else if (fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4e && fileBuffer[3] === 0x47) {
            ext = ".png";
          }
        }
        
        // Generate a unique filename using timestamp and random number
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileName = `${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, fileBuffer);
        
        const port = process.env.PORT || 5000;
        const baseUrl = process.env.SERVER_URL ?? `http://localhost:${port}`;
        const fileUrl = `${baseUrl}/uploads/${folderName}/${fileName}`;
        resolve(fileUrl);
      } catch (err) {
        reject(err || new HttpError(500, "Failed to upload file locally."));
      }
    });
  }

  // Cloudinary upload
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
        type: "private",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new HttpError(500, "Failed to upload file to Cloudinary."));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};