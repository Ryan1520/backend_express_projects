import { body, param, query } from "express-validator";

export const createUserValidator = [
  param("id").isUUID().withMessage("[id] must be a valid UUID"),
  query("name").notEmpty().withMessage("[name] is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("age").isInt({ min: 0 }).withMessage("[age] must be a positive number"),
];
