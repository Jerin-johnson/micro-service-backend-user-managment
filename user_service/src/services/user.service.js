import User from "../models/user.model.js";

export const getAllUsers = async (query) => {
  const { page = 1, limit = 10 } = query;

  return await User.find()
    .skip((page - 1) * limit)
    .limit(limit);
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
