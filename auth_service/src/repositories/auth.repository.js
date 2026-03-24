import { prisma } from "../../lib/prisma";
export const findByEmail = async (email) => {
    return prisma.authUser.findUnique({
        where: { email },
    });
};
export const createUser = async (data) => {
    return prisma.authUser.create({
        data,
    });
};
