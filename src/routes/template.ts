import express from "express";
import templateControllers from "../controllers/templateControllers";
import { paginate } from "../middleware/pagination";
import { requestValidation } from "../middleware/requestValidation";
import { createUserValidator } from "../validators/templateValidator";

const router = express.Router();

router.route("/").get(templateControllers.controller1).post(templateControllers.controller2).put(templateControllers.controller3);

router
  .route("/:id")
  .get(paginate, templateControllers.controllerRead)
  .post(requestValidation(createUserValidator), templateControllers.controllerCreate)
  .put(templateControllers.controllerUpdate)
  .delete(templateControllers.controllerDelete);

export default router;
