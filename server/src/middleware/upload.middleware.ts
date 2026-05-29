import path from "path";
import multer from "multer";
import { HttpError } from "../utils/httpError.js";

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, path.resolve("uploads", "salary-slips"));
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${req.user?.id ?? "borrower"}-${Date.now()}${extension}`);
  }
});

export const salarySlipUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new HttpError(400, "Salary slip must be a PDF, JPG, or PNG file."));
      return;
    }

    callback(null, true);
  }
});
