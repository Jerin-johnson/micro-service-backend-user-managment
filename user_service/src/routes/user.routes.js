import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { autheticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", autheticate, getProfile);

export default router;
