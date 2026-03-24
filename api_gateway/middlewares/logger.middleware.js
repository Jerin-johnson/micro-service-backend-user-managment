const morgan = require("morgan");

// Custom token: authenticated user ID (anonymous if not logged in)
morgan.token("user-id", (req) => req.user?.id ?? "anonymous");

// Custom token: which downstream service is being hit
morgan.token("service", (req) => {
  if (req.path.startsWith("/api/auth")) return "auth_service";
  if (req.path.startsWith("/api/users")) return "user_service";
  if (req.path.startsWith("/api/reports")) return "reporting_service";
  return "unknown";
});

// Output:
// [2024-06-10T12:00:00.000Z] POST /api/auth/login 200 12ms | ip=127.0.0.1 user=anonymous svc=auth_service
const requestLogger = morgan(
  "[:date[iso]] :method :url :status :response-time ms | ip=:remote-addr user=:user-id svc=:service",
);

module.exports = { requestLogger };
