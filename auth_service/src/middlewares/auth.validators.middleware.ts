import { NextFunction, Request, Response } from "express";

export const validRegisterRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) throw new Error("Provide valid details");
    next();
  } catch (err: unknown) {
    res.status(400).json({ message: err?.message });
  }
};

export const validLoginRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new Error("Provide valid details");
    next();
  } catch (err: unknown) {
    res.status(400).json({ message: err?.message });
  }
};
