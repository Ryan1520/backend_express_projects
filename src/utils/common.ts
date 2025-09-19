import { NextFunction, Response } from "express";
import { ErrorResponseI } from "../interfaces/common";

export const handleErrorWith = (next: NextFunction, message?: string, status?: number, data?: any) => {
  const error: ErrorResponseI = {
    status,
    message,
    data,
  };

  next(error);
  return;
};
