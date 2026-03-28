"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validators_middleware_1 = require("../middlewares/auth.validators.middleware");
const router = express_1.default.Router();
router.post("/register", auth_validators_middleware_1.validRegisterRequest, auth_controller_1.register);
router.post("/login", auth_validators_middleware_1.validLoginRequest, auth_controller_1.login);
router.get("/logout", auth_controller_1.logout);
exports.default = router;
