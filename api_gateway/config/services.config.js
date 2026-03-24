const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
    publicPaths: ["/api/auth/login", "/api/auth/register"],
  },
  user: {
    url: process.env.USER_SERVICE_URL || "http://localhost:4002",
    publicPaths: [],
  },
  reporting: {
    url: process.env.REPORTING_SERVICE_URL || "http://localhost:4003",
    publicPaths: [],
  },
};

// Flat list of all public paths — used by auth middleware to skip JWT check
const allPublicPaths = Object.values(services).flatMap((s) => s.publicPaths);

module.exports = { services, allPublicPaths };
