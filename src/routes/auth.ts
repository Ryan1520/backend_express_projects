import express from "express";
import authController from "../controllers/authController";

const router = express.Router();

router.post("/register", authController.handleRegistration).post("/login", authController.handleLogin);

export default router;
