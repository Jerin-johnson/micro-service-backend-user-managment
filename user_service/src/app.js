import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { connectDB } from "./configs/mongoose.connect.js";

const app = express();

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

connectDB();

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

app.listen(3000, () => console.log("User Service Running"));
