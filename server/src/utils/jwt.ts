import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "../types/roles.js";

type TokenPayload = {
  sub: string;
  role: Role;
  email: string;
};

export function signAuthToken(payload: TokenPayload) {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
