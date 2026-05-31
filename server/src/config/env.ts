import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Front‑end base URL (used for CORS)
  clientUrl: process.env.CLIENT_URL ?? `http://localhost:${process.env.PORT ?? 5000}`,
  // MongoDB connection string
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/loan-management-system",
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  // Server port
  port: Number(process.env.PORT ?? 5000),
  // Public URL for uploaded files
  SERVER_URL: process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? 5000}`,
};

