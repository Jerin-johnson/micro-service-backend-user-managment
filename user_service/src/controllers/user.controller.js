import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  res.json(user);
};
