import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import type { Role } from "../types/roles.js";

const PASSWORD = "Password@123";

const seedUsers: Array<{ fullName: string; email: string; role: Role }> = [
  { fullName: "Admin User", email: "admin@lms.local", role: "ADMIN" },
  { fullName: "Sales Executive", email: "sales@lms.local", role: "SALES" },
  { fullName: "Sanction Executive", email: "sanction@lms.local", role: "SANCTION" },
  { fullName: "Disbursement Executive", email: "disbursement@lms.local", role: "DISBURSEMENT" },
  { fullName: "Collection Executive", email: "collection@lms.local", role: "COLLECTION" },
  { fullName: "Borrower User", email: "borrower@lms.local", role: "BORROWER" }
];

async function seed() {
  await connectDb();
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const user of seedUsers) {
    await User.updateOne(
      { email: user.email },
      { $set: { fullName: user.fullName, email: user.email, role: user.role, passwordHash } },
      { upsert: true }
    );
  }

  console.log(`Seeded ${seedUsers.length} users. Password for all users: ${PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });