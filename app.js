import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import { User } from "./modules/users/model/user-model.js";
import userRouter from "./modules/users/routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

const mongodb_connect = process.env.mongodb_connect;

mongoose
  .connect(mongodb_connect)
  .then(() => console.log("Connection successful"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use("/user", userRouter);

app.listen(8000, () => {
  console.log("server is running without any problem");
});
