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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repo = __importStar(require("../repositories/auth.repository"));
const dotenv_1 = __importDefault(require("dotenv"));
const userClient_1 = require("../grpc/userClient");
const rabbitmq_producer_1 = require("../utils/rabbitmq.producer");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const registerUser = async (email, password, role, name) => {
    const existing = await repo.findByEmail(email);
    if (existing)
        throw new Error("User already exists");
    const hashed = await bcrypt_1.default.hash(password, 10);
    const authUser = await repo.createUser({
        email,
        password: hashed,
        role,
    });
    console.log("The auth user is", authUser);
    let userServiceId = null;
    try {
        const grpcRes = await userClient_1.userGrpcClient.createUser({
            auth_user_id: authUser.id,
            email: authUser.email,
            name,
            role: authUser.role,
        });
        console.log("the grpc request is ", grpcRes);
        if (!grpcRes.success)
            throw new Error(grpcRes.message);
        userServiceId = grpcRes.userId;
        // 5. Publish async event (Event-Driven)
        await rabbitmq_producer_1.rabbitMQProducer.publish(process.env.USER_CREATED_TOPIC, {
            event: "user.created",
            timestamp: new Date().toISOString(),
            data: {
                authUserId: authUser.id,
                userId: userServiceId,
                email: authUser.email,
                name,
                role: authUser.role,
            },
        });
    }
    catch (err) {
        await repo.deleteUser(authUser.id);
        throw new Error("Failed to create user profile");
    }
    const token = jsonwebtoken_1.default.sign({ id: authUser.id, role: authUser.role, email: authUser.email }, process.env.JWT_SECRET, { expiresIn: "500m" });
    return { token, user: { id: authUser.id, email, role: authUser.role, name } };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await repo.findByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }
    if (!user.isActive) {
        throw new Error("You're blocked by admin");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
        expiresIn: "500m",
    });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};
exports.loginUser = loginUser;
