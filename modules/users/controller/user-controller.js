import { generateVerificationToken } from "../../../utils/generateVerificationToken.js";
import { User } from "../model/user-model.js";
import bcrypt from "bcrypt";
import { generateJWTToken } from "../../../utils/generateJWTToken.js";
import crypto from "crypto";
import {
  passwordResetEmail,
  sendResetSuccessEmail,
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

//Logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

//ForgotPassword
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;

    await user.save();
    await passwordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
    );

    return res.status(200).json({
      message: "Reset password link is sent to your email",
    });
  } catch (error) {
    console.log("Error sending the reset password mail", error);
  }
};

//Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }
    const encPassword = await bcrypt.hash(password, 10);
    user.password = encPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);
    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error resetting password", error);
  }
};

export const checkUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    res
      .status(200)
      .json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.log("error checking user", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
