import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../users/model/user-model.js";

dotenv.config();

mongoose
  .connect(process.env.mongodb_connect, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const createAdmin = async () => {
  try {
    console.log("Admin Email:", process.env.ADMIN_EMAIL);
    console.log("Admin Password:", process.env.ADMIN_PASSWORD);

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    console.log("Hashed Password:", hashedPassword);

    const admin = new User({
      name: "Dipson Budhatoki",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("Saving admin user...");
    await admin.save();
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

createAdmin().catch(console.error);
