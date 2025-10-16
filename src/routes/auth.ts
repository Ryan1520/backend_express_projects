import express from "express";
import authController from "../controllers/authController";

const router = express.Router();

router
  .post("/register", authController.handleRegistration)
  .post("/login", authController.handleLogin)
  .post("/logout", authController.handleLogout)
  .get("/refresh", authController.handleRefreshToken);

export default router;
