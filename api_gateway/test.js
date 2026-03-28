const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/api/test-cors", (req, res) => {
  console.log("✅ Test endpoint hit from origin:", req.headers.origin);
  res.json({ message: "CORS test successful" });
});

const PORT = 5001; // Different port to avoid conflict
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
});
