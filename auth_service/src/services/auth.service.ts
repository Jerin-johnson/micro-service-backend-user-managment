import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as repo from "../repositories/auth.repository";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const registerUser = async (
  email: string,
  password: string,
  role: "USER" | "ADMIN" = "USER",
) => {
  const existing = await repo.findByEmail(email);

  if (existing) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await repo.createUser({
    email,
    password: hashed,
    role,
  });

  console.log("jwt secert is ", JWT_SECRET);

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "600m",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await repo.findByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "15m",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};
