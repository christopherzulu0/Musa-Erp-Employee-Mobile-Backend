"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Create a singleton Prisma client
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
exports.prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map