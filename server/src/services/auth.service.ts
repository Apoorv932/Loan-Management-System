import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { signAuthToken } from "../utils/jwt.js";

const SALT_ROUNDS = 12;

export async function signup(input: { fullName: string; email: string; password: string }) {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    role: "BORROWER"
  });

  return createAuthResponse(user);
}

export async function login(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new HttpError(401, "Invalid email or password.");
  }

  return createAuthResponse(user);
}

function createAuthResponse(user: {
  _id: unknown;
  fullName: string;
  email: string;
  role: "ADMIN" | "SALES" | "SANCTION" | "DISBURSEMENT" | "COLLECTION" | "BORROWER";
}) {
  const id = String(user._id);
  const token = signAuthToken({ sub: id, role: user.role, email: user.email });

  return {
    token,
    user: {
      id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  };
}
