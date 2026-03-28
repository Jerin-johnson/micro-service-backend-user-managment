"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("../lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const user_event_consumer_1 = require("./utils/user.event.consumer");
dotenv_1.default.config();
const PORT = process.env.PORT || 5001;
const checkDB = async () => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        console.log("✅ DB is reachable and working");
    }
    catch (err) {
        console.error(" DB query failed:", err);
    }
};
checkDB();
app_1.default.listen(PORT, async () => {
    await (0, user_event_consumer_1.connectConsumer)();
    console.log(`Auth Service running on port ${PORT}`);
});
