const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { authRateLimiter } = require("../middlewares/ratelimit.middleware");
const { services } = require("../config/services.config");
const { authorize } = require("../middlewares/auth.middleware");

const router = Router();

const createProxy = (target, pathPrefix) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // pathRewrite: { [`^${pathPrefix}`]: "" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Proxy] ${req.method} ${req.path} → ${target}`);
      },
      error: (err, req, res) => {
        console.error(`[Proxy Error] ${err.message}`);
        res.status(502).json({ error: "Upstream service unavailable" });
      },
    },
  });
};

// ── Auth Service (/api/auth/*) ─────────────────────────────────────────────
// Stricter rate limit here — login/register are public (whitelisted in auth middleware)
router.use(
  "/api/auth",
  authRateLimiter,
  createProxy(services.auth.url, "/api/auth"),
);

// ── User Service (/api/users/*) ───────────────────────────────────────────
// Any authenticated user can access
router.use("/api/users", createProxy(services.user.url, "/api/users"));

// ── Reporting Service (/api/reports/*) ────────────────────────────────────
// Only admins and analysts — role guard runs before the proxy
router.use(
  "/api/reports",
  authorize("admin", "analyst"),
  createProxy(services.reporting.url, "/api/reports"),
);

// ── 404 for anything else ─────────────────────────────────────────────────
router.use((req, res, next) => {
  next();
  // res.status(404).json({ error: `Route ${req.path} not found on gateway` });
});

module.exports = router;
