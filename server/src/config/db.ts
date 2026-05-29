import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  try {
    console.log("Connecting to MongoDB...");

    mongoose.set("strictQuery", true);

    const connection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}/${connection.connection.name}`
    );
  } catch (error) {
    console.error("MongoDB connection failed.");
    console.error(error);
    process.exit(1);
  }
}
