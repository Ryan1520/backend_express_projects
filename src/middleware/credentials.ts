import { NextFunction, Request, Response } from "express";
import { originWhiteList } from "../config/originWhiteList";

export const credentials = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req?.headers?.origin || originWhiteList[0];
  if (originWhiteList.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};
