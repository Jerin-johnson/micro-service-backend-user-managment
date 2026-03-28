import { Request, Response } from "express";
import * as service from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name } = req.body;

    const data = await service.registerUser(email, password, role, name);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(201).json({
      message: "User registered",
      data,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const data = await service.loginUser(email, password);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.json(data);
  } catch (err: any) {
    console.log("err is", err);
    return res.status(401).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.json({ message: "logout successfully" });
  } catch (err: any) {
    console.log("err is", err);
    res.status(401).json({ message: err.message });
  }
};
