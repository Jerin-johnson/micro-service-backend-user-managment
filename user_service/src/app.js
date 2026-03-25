import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { connectDB } from "./configs/mongoose.connect.js";
import startGrpcServer from "./grpc/server.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log("User Service Hit:", req.method, req.url);
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

connectDB();

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

app.listen(5002, () => {
  console.log("The User service is running on the port 5002");
  startGrpcServer();
});
