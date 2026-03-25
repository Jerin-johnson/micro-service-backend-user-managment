import mongoose from "mongoose";

const userReportSchema = new mongoose.Schema({
  authUserId: {
    // Better to store both IDs
    type: Number,
    required: true,
  },
  // userId: {
  //   // MongoDB ID from User Service
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("UserReport", userReportSchema);
