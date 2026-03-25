require("dotenv").config();

// Crash fast if required env vars are missing — better than silent failures in prod
// const REQUIRED_ENV = [
//   "JWT_SECRET",
//   "AUTH_SERVICE_URL",
//   "USER_SERVICE_URL",
//   "REPORTING_SERVICE_URL",
// ];
// const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
// if (missing.length > 0) {
//   console.error(`[Startup] Missing env vars: ${missing.join(", ")}`);
//   process.exit(1);
// }

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────┐
│         API Gateway running             │
├─────────────────────────────────────────┤
│  http://localhost:${PORT}                   │
│                                         │
│  /api/auth    → auth_service :5001      │
│  /api/users   → user_service :5002      │
│  /api/reports → reporting_service :5003 │
└─────────────────────────────────────────┘
  `);
});

// Graceful shutdown on SIGTERM (Docker/k8s) or SIGINT (Ctrl+C)
const shutdown = (signal) => {
  console.log(`\n[Gateway] ${signal} received. Shutting down...`);
  server.close(() => {
    console.log("[Gateway] Closed. Exiting.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000); // force exit after 10s
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
