import { NextFunction, Request, Response } from "express";
import { logEvents } from "./logEvents";
import { ErrorTypeE } from "../common/enums";
import { ErrorResponseI } from "../interfaces/common";

export const errorHandler = (
  err: ErrorResponseI,
  req: Request,
  res: Response,
  next: any
) => {
  logEvents(`${err.status}: ${err.message}`, "errLog.txt");
  console.error(`❗️❗️❗️Error: ${err.message || ErrorTypeE.INTERNAL_SERVER_ERROR}`);
  res.status(err.status || 500).json({
    message: err.message || ErrorTypeE.INTERNAL_SERVER_ERROR,
    data: err.data || {},
  });
};
