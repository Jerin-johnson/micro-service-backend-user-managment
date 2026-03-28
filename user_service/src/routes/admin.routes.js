import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { autheticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { getProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.use(autheticate, allowRoles("ADMIN"));

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUser);
router.put("/users/:id", adminController.updateUserByAdmin);
router.patch("/users/:id", adminController.deleteUserByAdmin);
router.get("/me", getProfile);

export default router;
