"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRabbitMQ = exports.getConnection = exports.getChannel = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const DEFAULT_CONFIG = {
    url: process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
    reconnectDelayMs: 5000,
    maxReconnectAttempts: 10,
};
// ─── State ────────────────────────────────────────────────────────────────────
let connection = null; // ✅ ChannelModel, not Connection
let channel = null;
let reconnectAttempts = 0;
let isConnecting = false;
// ─── Core ─────────────────────────────────────────────────────────────────────
const connectRabbitMQ = async (config) => {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    if (isConnecting) {
        throw new Error("Connection attempt already in progress.");
    }
    isConnecting = true;
    try {
        connection = await amqplib_1.default.connect(cfg.url);
        reconnectAttempts = 0;
        connection.on("close", () => {
            console.warn("⚠️  RabbitMQ connection closed. Reconnecting…");
            connection = null;
            channel = null;
            scheduleReconnect(cfg);
        });
        connection.on("error", (err) => {
            console.error("❌ RabbitMQ connection error:", err.message);
        });
        channel = await connection.createChannel();
        channel.on("close", () => {
            console.warn("⚠️  RabbitMQ channel closed.");
            channel = null;
        });
        channel.on("error", (err) => {
            console.error("❌ RabbitMQ channel error:", err.message);
        });
        console.log("✅ RabbitMQ connected successfully.");
        return { connection, channel };
    }
    finally {
        isConnecting = false;
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
// ─── Reconnect ────────────────────────────────────────────────────────────────
const scheduleReconnect = (cfg) => {
    if (reconnectAttempts >= cfg.maxReconnectAttempts) {
        console.error("❌ Max reconnect attempts reached. Giving up.");
        return;
    }
    reconnectAttempts++;
    const delay = cfg.reconnectDelayMs * reconnectAttempts; // exponential-ish backoff
    console.log(`🔄 Reconnect attempt ${reconnectAttempts}/${cfg.maxReconnectAttempts} in ${delay}ms…`);
    setTimeout(() => (0, exports.connectRabbitMQ)(cfg).catch(console.error), delay);
};
// ─── Accessors ────────────────────────────────────────────────────────────────
/**
 * Returns the active channel, throwing if unavailable.
 * Use this in your publishers/consumers instead of the raw variable.
 */
const getChannel = () => {
    if (!channel)
        throw new Error("RabbitMQ channel is not available.");
    return channel;
};
exports.getChannel = getChannel;
const getConnection = () => {
    if (!connection)
        throw new Error("RabbitMQ connection is not available.");
    return connection;
};
exports.getConnection = getConnection;
// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const disconnectRabbitMQ = async () => {
    try {
        await channel?.close();
        await connection?.close();
        console.log("✅ RabbitMQ disconnected gracefully.");
    }
    catch (err) {
        console.error("❌ Error during RabbitMQ disconnect:", err);
    }
    finally {
        channel = null;
        connection = null;
    }
};
exports.disconnectRabbitMQ = disconnectRabbitMQ;
// Hook into process shutdown signals
process.once("SIGINT", exports.disconnectRabbitMQ);
process.once("SIGTERM", exports.disconnectRabbitMQ);
