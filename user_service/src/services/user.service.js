import User from "../models/user.model.js";
import {
  findOneByEmail,
  getAllUsers,
  getUserById,
} from "../repositories/user.repo.js";
import { rabbitMQProducer } from "../utils/producer.js";

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
    return {
      success: true,
      userId: existing.id,
    };
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

export const getAllUsersService = async (data, adminId) => {
  const result = await getAllUsers(data, adminId);

  console.log("the result is ", result);

  return result;
};

export const getUserByIdService = async (userId) => {
  const result = await getUserById(userId);

  console.log("the result is ", result);

  return result;
};

export const userServicePlusEvent = {
  // Admin - Update user (name, role, isActive, etc.)
  updateUser: async (authUserId, updateData) => {
    console.log("the updated data is", updateData);
    const updatedUser = await User.findOneAndUpdate(
      { authUserId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedUser) throw new Error("User not found");

    // Publish event for other services
    await rabbitMQProducer.publish("user.updated", {
      event: "user.updated",
      timestamp: new Date().toISOString(),
      data: {
        authUserId: updatedUser.authUserId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });

    return updatedUser;
  },

  // Admin - Block/Deactivate user
  deactivateUser: async (authUserId) => {
    const updatedUser = await User.findOne({ authUserId });

    updatedUser.isActive = !updatedUser.isActive;

    updatedUser.save();

    if (!updatedUser) throw new Error("User not found");

    await rabbitMQProducer.publish("user.deactivated", {
      event: "user.deactivated",
      timestamp: new Date().toISOString(),
      data: {
        authUserId: updatedUser.authUserId,
        isActive: updatedUser.isActive,
      },
    });

    return updatedUser;
  },

  // Admin - Delete user (soft delete by setting isActive = false + publish event)
  deleteUser: async (authUserId) => {
    const deletedUser = await User.findOneAndUpdate(
      { authUserId },
      { isActive: false }, // soft delete
      { new: true },
    );

    if (!deletedUser) throw new Error("User not found");

    await rabbitMQProducer.publish("user.deleted", {
      event: "user.deleted",
      timestamp: new Date().toISOString(),
      data: { authUserId: deletedUser.authUserId },
    });

    return { message: "User soft deleted successfully" };
  },
};
