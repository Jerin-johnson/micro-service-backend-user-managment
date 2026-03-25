import User from "../models/user.model.js";

export const getAllUsers = async (query, adminId) => {
  const { page = 1, limit = 10 } = query;

  console.log("The admin Id is ", adminId);

  return await User.find({
    authUserId: { $nin: [adminId] },
  })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const getUserById = async (id) => {
  return await User.findOne({ authUserId: id });
};

export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const findOneByEmail = async (email) => {
  return await User.findOne({ email });
};
