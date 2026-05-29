import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { borrowerRouter } from "./routes/borrower.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/borrower", borrowerRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
