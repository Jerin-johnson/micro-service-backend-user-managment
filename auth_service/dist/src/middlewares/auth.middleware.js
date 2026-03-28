"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secert");
        // req.user = decoded;
        next();
    }
    catch {
        res.status(403).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
const allowRoles = (...roles) => {
    return (req, res, next) => {
        // if (!roles.includes(req.user.role)) {
        //   return res.status(403).json({ message: "Forbidden" });
        // }
        next();
    };
};
exports.allowRoles = allowRoles;
