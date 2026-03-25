import jwt from "jsonwebtoken";

export const attachUser = (req, res, next) => {
  console.log("Headers:", req.headers);

  try {
    const email = req.headers["x-user-email"];
    const id = req.headers["x-user-id"];

    console.log("Email:", email);
    console.log("ID:", id);

    const isValid = email && id;
    console.log("isValid:", isValid);

    if (!isValid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { email, id };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
