import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    authUserId: {
      // Important: link with Auth Service
      type: Number,
      required: true,
      unique: true,
    },
    name: String,
    email: { type: String, unique: true },
    password: String,

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
