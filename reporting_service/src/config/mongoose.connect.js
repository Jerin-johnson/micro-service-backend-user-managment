import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    await connect(MONGO_URI);
    console.log(" MongoDB Connected successfully");
  } catch (err) {
    console.error(" MongoDB Connection Error:", err);
    process.exit(1);
  }
};
