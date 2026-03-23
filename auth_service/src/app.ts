import express from "express";
import authRoutes from "./routers/auth.routes";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

export default app;
