import { NextFunction, Request, Response } from "express";

export const paginate = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  res.locals.pagination = {
    page,
    limit,
    skip,
  };

  next();
};
