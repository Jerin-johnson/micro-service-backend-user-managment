const rateLimit = require("express-rate-limit");

// Global limiter — 100 requests per minute per IP
const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict limiter for auth routes — protects against brute-force
// Only counts failed requests (skipSuccessfulRequests: true)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many auth attempts. Wait 15 minutes and try again." },
});

module.exports = { globalRateLimiter, authRateLimiter };
