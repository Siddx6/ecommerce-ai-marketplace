import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "../utils/loadEnv.js";
import User from "../models/User.js";

const ADMIN_NAME = "Admin User";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "adminpassword123";

async function createAdmin() {
  await mongoose.connect("mongodb://localhost:27017/ecommerce_db");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created:", admin.email);
  await mongoose.disconnect();
}

createAdmin();