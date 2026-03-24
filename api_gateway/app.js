const express = require("express");
const { requestLogger } = require("./middlewares/logger.middleware");
const { globalRateLimiter } = require("./middlewares/ratelimit.middleware");
const { authenticate } = require("./middlewares/auth.middleware");
const router = require("./routers");

const app = express();

const cookieParser = require("cookie-parser");

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api_gateway" });
});
app.use(cookieParser());

// ── Middleware order matters ───────────────────────────────────────────────
app.use(express.json()); // 1. Parse request body
app.use(requestLogger); // 2. Log every request (before any rejection)
app.use(globalRateLimiter); // 3. Drop excessive traffic early
app.use(authenticate); // 4. Verify JWT, inject x-user-* headers
app.use(router); // 5. Proxy to the right service

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
