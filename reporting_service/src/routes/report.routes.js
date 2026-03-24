import express from "express";
import { getDashboard } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/users", getDashboard);

export default router;
