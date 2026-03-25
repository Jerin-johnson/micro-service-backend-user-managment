import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as repo from "../repositories/auth.repository";
import dotenv from "dotenv";
import { error } from "node:console";
import { userGrpcClient } from "../grpc/userClient";
import { rabbitMQProducer } from "../utils/rabbitmq.producer";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const registerUser = async (
  email: string,
  password: string,
  role: "USER" | "ADMIN",
  name: string,
) => {
  const existing = await repo.findByEmail(email);
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const authUser = await repo.createUser({
    email,
    password: hashed,
    role,
  });

  console.log("The auth user is", authUser);

  let userServiceId: number | null = null;

  try {
    const grpcRes = await userGrpcClient.createUser({
      auth_user_id: authUser.id,
      email: authUser.email,
      name,
      role: authUser.role,
    });

    console.log("the grpc request is ", grpcRes);

    if (!grpcRes.success) throw new Error(grpcRes.message);
    userServiceId = grpcRes.userId;

    // 5. Publish async event (Event-Driven)
    await rabbitMQProducer.publish(process.env.USER_CREATED_TOPIC!, {
      event: "user.created",
      timestamp: new Date().toISOString(),
      data: {
        authUserId: authUser.id,
        userId: userServiceId,
        email: authUser.email,
        name,
        role: authUser.role,
      },
    });
  } catch (err: any) {
    await repo.deleteUser(authUser.id);
    throw new Error("Failed to create user profile");
  }

  const token = jwt.sign(
    { id: authUser.id, role: authUser.role, email: authUser.email },
    process.env.JWT_SECRET!,
    { expiresIn: "500m" },
  );

  return { token, user: { id: authUser.id, email, role: authUser.role, name } };
};

export const loginUser = async (email: string, password: string) => {
  const user = await repo.findByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    {
      expiresIn: "500m",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};
