import dotenv from "dotenv";

dotenv.config();

export const env = {
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/loan-management-system",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  port: Number(process.env.PORT ?? 5000),
  SERVER_URL: process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? 5000}`
};
