import jwt from "jsonwebtoken";

export const autheticate = (req, res, next) => {
  console.log("Headers:", req.headers);

  try {
    const email = req.headers["x-user-email"];
    const id = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    console.log("Email:", email);
    console.log("ID:", id);
    console.log("Role:", role);

    const isValid = email && id && role;
    console.log("isValid:", isValid);

    if (!isValid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("The req user is", req.user);

    req.user = { email, id, role };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
