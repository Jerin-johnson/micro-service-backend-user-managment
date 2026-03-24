import express from "express";
import reportRoutes from "./routes/report.routes.js";

const app = express();

app.use(express.json());
app.use("/api/reports", reportRoutes);

export default app;
