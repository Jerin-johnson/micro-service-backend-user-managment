import { prisma } from "../../lib/prisma";

export const findByEmail = async (email: string) => {
  return prisma.authUser.findUnique({
    where: { email },
  });
};

export const createUser = async (data: {
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
}) => {
  return prisma.authUser.create({
    data,
  });
};

export const deleteUser = async (id: number) => {
  return prisma.authUser.delete({ where: { id } });
};
