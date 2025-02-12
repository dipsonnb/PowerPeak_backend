import express from "express";
import { verifyToken } from "../../../middleware/verifyToken.js";
import {
  login,
  register,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkUser,
} from "../controller/user-controller.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/logout", logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.post("/check-user", verifyToken, checkUser);

export default userRouter;
