import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { attachUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", attachUser, getProfile);

export default router;
