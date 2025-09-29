import { NextFunction, Request, Response } from "express";
import { ValidationChain, ValidationError, validationResult } from "express-validator";
import { isEmpty } from "lodash";
import { ErrorTypeE } from "../common/enums";

export const requestValidation = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (isEmpty(errors.array())) {
      return next();
    }

    errors.array().forEach((error) => {
      console.error(`🔶🔶🔶 Validation error: ${error.msg}`);
    });

    res.status(400).json({
      errors: errors.array().map((err: ValidationError) => ({
        type: ErrorTypeE.INVALID_REQUEST,
        msg: err.msg,
      })),
    });
  };
};
