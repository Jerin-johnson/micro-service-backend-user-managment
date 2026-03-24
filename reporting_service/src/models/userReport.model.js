import mongoose from "mongoose";

const userReportSchema = new mongoose.Schema({
  userId: String,
  role: {
    type: String,
    enum: ["USER", "ADMIN", "MODERATOR"],
  },
  createdAt: Date,
});

export default mongoose.model("UserReport", userReportSchema);
