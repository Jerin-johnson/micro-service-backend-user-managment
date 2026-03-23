import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};
