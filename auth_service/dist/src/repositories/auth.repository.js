"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteAuthUser = exports.updateAuthUser = exports.deleteUser = exports.createUser = exports.findByEmail = void 0;
const prisma_1 = require("../../lib/prisma");
const findByEmail = async (email) => {
    return prisma_1.prisma.authUser.findUnique({
        where: { email },
    });
};
exports.findByEmail = findByEmail;
const createUser = async (data) => {
    return prisma_1.prisma.authUser.create({
        data,
    });
};
exports.createUser = createUser;
const deleteUser = async (id) => {
    return prisma_1.prisma.authUser.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
const updateAuthUser = async (id, updateData) => {
    return prisma_1.prisma.authUser.update({
        where: { id },
        data: updateData,
    });
};
exports.updateAuthUser = updateAuthUser;
const softDeleteAuthUser = async (id) => {
    return prisma_1.prisma.authUser.update({
        where: { id },
        data: { isActive: false },
    });
};
exports.softDeleteAuthUser = softDeleteAuthUser;
