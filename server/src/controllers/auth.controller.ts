import type { Request, Response } from "express";
import { login, signup } from "../services/auth.service.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";

export async function signupController(req: Request, res: Response) {
  const input = signupSchema.parse(req.body);
  const result = await signup(input);
  return res.status(201).json(result);
}

export async function loginController(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await login(input);
  return res.status(200).json(result);
}

export async function meController(req: Request, res: Response) {
  return res.status(200).json({ user: req.user });
}
