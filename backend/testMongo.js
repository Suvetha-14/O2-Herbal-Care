import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ MONGO_URI is not set in environment variables");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected successfully via environment variable");
  process.exit(0);
} catch (err) {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
}
