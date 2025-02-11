import { generateVerificationToken } from "../../../utils/generateVerificationToken.js";
import { User } from "../model/user-model.js";
import bcrypt from "bcrypt";
import { generateJWTToken } from "../../../utils/generateJWTToken.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../../../resend/email.js";

// Registration
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      throw new Error("Please provide all details");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      throw new Error("User already exists");
    }
    const encPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateVerificationToken();

    const user = new User({
      name,
      email,
      password: encPassword,
      verificationToken,
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
    });
    await user.save();

    generateJWTToken(res, user._id);

    await sendVerificationEmail(user.email, user.verificationToken);

    return res.status(200).json({
      message: "User registered successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    console.log("Received token:", token);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("User not found or token expired");
      throw new Error("Invalid or expired token");
    }

    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    user.isVerified = true;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
};

//Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "The given credentials are invalid" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "The given credentials are invalid" });
    }
    const isVerified = user.isVerified;
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email to login",
      });
    }
    generateJWTToken(res, user._id);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log("Error logging in:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
