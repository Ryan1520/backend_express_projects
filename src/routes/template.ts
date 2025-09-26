import express from "express";
import templateControllers from "../controllers/templateControllers";
import { paginate } from "../middleware/pagination";

const router = express.Router();

router.route("/").get(templateControllers.controller1).get(templateControllers.controller2).get(templateControllers.controller3);

router
  .route("/:id")
  .get(paginate, templateControllers.controllerRead)
  .post(templateControllers.controllerCreate)
  .put(templateControllers.controllerUpdate)
  .delete(templateControllers.controllerDelete);

export default router;
