import express from "express";
import templateControllers from "../controllers/templateControllers";

const router = express.Router();

router
  .route("/")
  .get(templateControllers.controller1)
  .post(templateControllers.controller2);

router.get("/:id", templateControllers.controller3);

export default router;
