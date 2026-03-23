import app from "./app";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5001;

const checkDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ DB is reachable and working");
  } catch (err) {
    console.error("❌ DB query failed:", err);
  }
};

checkDB();

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
