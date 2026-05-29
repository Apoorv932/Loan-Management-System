import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import { verifyAuthToken } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new HttpError(401, "Authentication required."));
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email
    };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token."));
  }
}
