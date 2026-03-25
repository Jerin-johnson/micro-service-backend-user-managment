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
    pathRewrite: (path, req) => {
      return req.originalUrl; // send full path
    },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Proxy] ${req.method} ${req.url} → ${target}`);
        if (req.body) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        console.error(`[Proxy Error] ${err.message}`);
        res.status(502).json({ error: "Upstream service unavailable" });
      },
    },
    timeout: 5000,
    proxyTimeout: 5000,
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
router.use("/api/user", createProxy(services.user.url, "/api/user"));

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
