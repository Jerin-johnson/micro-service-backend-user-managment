import * as userService from "../services/user.service.js";

export const getUsers = async (req, res) => {
  const users = await userService.getAllUsersService(req.query, req.user.id);
  res.json(users);
};

export const getUser = async (req, res) => {
  console.log("the id is ", req.params.id);
  const user = await userService.getUserByIdService(req.params.id);
  res.json(user);
};

export const updateUserByAdmin = async (req, res) => {
  const user = await userService.userServicePlusEvent.updateUser(
    req.params.id,
    req.body,
  );
  res.json(user);
};

export const deleteUserByAdmin = async (req, res) => {
  const result = await userService.userServicePlusEvent.deactivateUser(
    req.params.id,
  );

  console.log(result);
  res.json({ message: result.isActive ? "User activted" : "User deactivated" });
};
