import express from "express";
import authRoutes from "./routers/auth.routes";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log("Auth Service Hit:", req.method, req.url);
  next();
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "auth_service" });
});

app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
  console.log("the request is");
  res.status(404).json({ error: `Route ${req.path} not found on gateway` });
});

app.use((err: any, req: express.Request, reply: express.Response) => {
  reply.status(500).send({ error: err.message || "something went wrong" });
});

export default app;
