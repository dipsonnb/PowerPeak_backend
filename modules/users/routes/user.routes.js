import express from "express";
import {
  login,
  register,
  logout,
  verifyEmail,
} from "../controller/user-controller.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/logout", logout);

export default userRouter;
