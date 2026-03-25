const jwt = require("jsonwebtoken");
const { allPublicPaths } = require("../config/services.config.js");
const dotenv = require("dotenv").config();

const authenticate = (req, res, next) => {
  // ✅ Check public routes
  const isPublic = allPublicPaths.some((path) => req.path.startsWith(path));

  if (isPublic || req.path.includes("/health")) {
    console.log("Public route, skipping auth");
    return next();
  }

  // ✅ Get token from cookies
  const token = req.cookies?.token;

  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      error: "Missing token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("The decoded things is", decoded);

    req.user = decoded;

    // ✅ Inject headers for microservices
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-role"] = decoded.role;
    req.headers["x-user-email"] = decoded.email;

    // ✅ Remove sensitive token
    delete req.headers["authorization"];

    console.log("The req user is api gateway", req.user);

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;

// Role guard — drop this in front of any route that needs a specific role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user?.role.toLowerCase())) {
      return res
        .status(403)
        .json({ error: `Role '${req.user.role}' is not allowed here` });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
