import User from "../models/user.model.js";
import { findOneByEmail } from "../repositories/user.repo.js";

export const createProfile = async (data) => {
  // check if already exists (idempotent — safe to call twice)
  const existing = await findByAuthId(data.authId);
  if (existing) return existing;

  return repo.createUser({
    authId: data.authId,
    email: data.email,
    role: data.role,
  });
};

export const getProfile = async (authId) => {
  const user = await repo.findByAuthId(authId);
  if (!user) throw new Error("Profile not found");
  return user;
};

export const createUser = async (data) => {
  const { authUserId, email, name, role } = data;

  console.log("The data is ", data);

  // Check if user already exists
  const existingUser = await findOneByEmail(email);
  if (existingUser) {
    throw new Error("User already exists in User Service");
  }

  const newUser = new User({
    authUserId,
    email,
    name,
    role,
  });

  await newUser.save();

  console.log(`User created in User Service with ID: ${newUser._id}`);

  return {
    userId: newUser._id, // MongoDB _id (ObjectId) converted to string later if needed
    success: true,
  };
};
