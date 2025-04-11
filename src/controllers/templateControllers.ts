import { NextFunction, Request, Response } from "express";
import { db } from "../config/sqldb";
import { handleErrorWith } from "../utils/common";

const controller1 = (req: Request, res: Response, next: NextFunction) => {
  handleErrorWith(next, "not_found", 404, { id: "123" });
};
const controller2 = (req: Request, res: Response, next: NextFunction) => {};
const controller3 = (req: Request, res: Response, next: NextFunction) => {};

export default { controller1, controller2, controller3 };
