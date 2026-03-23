import { Request, Response } from "express";
import * as service from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const data = await service.registerUser(email, password, role);

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

    res.json(data);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};
