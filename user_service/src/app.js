import express from "express";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { connectDB } from "./configs/mongoose.connect.js";
import startGrpcServer from "./grpc/server.js";
import { rabbitMQProducer } from "./utils/producer.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log("User Service Hit:", req.method, req.url);
  console.log("req.body:", req.method, req.body);

  next();
});

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

connectDB();

const shutdown = async () => {
  console.log("shutdowing queue service");
  await rabbitMQProducer.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(5002, async () => {
  console.log("The User service is running on the port 5002");
  await rabbitMQProducer.connect();
  startGrpcServer();
});
