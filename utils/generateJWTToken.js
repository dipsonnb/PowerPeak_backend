import JWT from "jsonwebtoken";

export const generateJWTToken = (res, userId) => {
  const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};
