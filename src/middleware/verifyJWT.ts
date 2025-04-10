import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader?.split(" ")[1] || "";

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "",
    (err: any, decoded: any) => {
      if (err) {
        res.sendStatus(403); //invalid token
        return;
      }
      (req as any).email = decoded.email;
      next();
    }
  );
};
