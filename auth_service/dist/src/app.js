"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routers/auth.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log("Auth Service Hit:", req.method, req.url);
    next();
});
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "auth_service" });
});
app.use("/api/auth", auth_routes_1.default);
app.use((req, res, next) => {
    console.log("the request is");
    res.status(404).json({ error: `Route ${req.path} not found on gateway` });
});
app.use((err, req, reply) => {
    reply.status(500).send({ error: err.message || "something went wrong" });
});
exports.default = app;
