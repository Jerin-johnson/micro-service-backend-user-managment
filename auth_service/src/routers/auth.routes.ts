import express from "express";
import { login, register } from "../controllers/auth.controller";
import {
  validLoginRequest,
  validRegisterRequest,
} from "../middlewares/auth.validators.middleware";

const router = express.Router();

router.post("/register", validRegisterRequest, register);
router.post("/login", validLoginRequest, login);

export default router;
