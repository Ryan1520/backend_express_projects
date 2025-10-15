import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyOtp = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.jwt || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No OTP token provided" });
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", async (error: any, decoded: any) => {
    if (error) {
      res.status(403).json({ message: "Forbidden: Invalid OTP token" });
      return;
    }

    (req as any).userId = decoded.id;

    next();
  });
};
