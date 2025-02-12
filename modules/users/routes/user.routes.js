import express from "express";
import {
  login,
  register,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controller/user-controller.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/logout", logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);

export default userRouter;
