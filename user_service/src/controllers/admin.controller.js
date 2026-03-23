import * as userService from "../services/user.service.js";

export const getUsers = async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res.json(users);
};

export const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
};

export const updateUserByAdmin = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
};

export const deleteUserByAdmin = async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: "User deleted" });
};
