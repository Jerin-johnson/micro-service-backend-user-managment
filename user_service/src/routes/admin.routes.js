import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, allowRoles("ADMIN"));

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUser);
router.put("/users/:id", adminController.updateUserByAdmin);
router.delete("/users/:id", adminController.deleteUserByAdmin);

export default router;
