const express = require("express");
const { requestLogger } = require("./middlewares/logger.middleware");
const { globalRateLimiter } = require("./middlewares/ratelimit.middleware");
const { authenticate } = require("./middlewares/auth.middleware");
const router = require("./routers");
const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

app.use((req, res, next) => {
  console.log(
    "🔥 REQUEST:",
    req.method,
    req.url,
    "from origin:",
    req.headers.origin,
  );
  next();
});

// CORS Configuration - THIS MUST BE EARLY
const corsOptions = {
  origin: ["http://localhost:3000", "http://mfe.local"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false, // Don't pass preflight to next handler
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.get("/api/test-cors", (req, res) => {
  console.log("🧪 TEST endpoint hit from origin:", req.headers.origin);
  res.json({ message: "CORS test successful" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "api_gateway" });
});

app.use(express.json()); //  Parse request body
app.use(requestLogger); //  Log every request (before any rejection)
app.use(globalRateLimiter);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next(); // Skip auth for preflight
  }
  authenticate(req, res, next);
});
app.use(router); //  Proxy to the right service

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
