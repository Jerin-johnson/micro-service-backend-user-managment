import express from "express";
import { login, register, logout } from "../controllers/auth.controller";
import {
  validLoginRequest,
  validRegisterRequest,
} from "../middlewares/auth.validators.middleware";

const router = express.Router();

router.post("/register", validRegisterRequest, register);
router.post("/login", validLoginRequest, login);
router.get("/logout", logout);

export default router;
