"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const service = __importStar(require("../services/auth.service"));
const register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        const data = await service.registerUser(email, password, role, name);
        res.cookie("token", data.token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.status(201).json({
            message: "User registered",
            data,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await service.loginUser(email, password);
        res.cookie("token", data.token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res.json(data);
    }
    catch (err) {
        console.log("err is", err);
        return res.status(401).json({ message: err.message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res.json({ message: "logout successfully" });
    }
    catch (err) {
        console.log("err is", err);
        res.status(401).json({ message: err.message });
    }
};
exports.logout = logout;
