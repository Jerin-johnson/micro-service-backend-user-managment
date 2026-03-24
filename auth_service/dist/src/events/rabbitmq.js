import amqp from "amqplib";
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
export const connectRabbitMQ = async (config) => {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    if (isConnecting) {
        throw new Error("Connection attempt already in progress.");
    }
    isConnecting = true;
    try {
        connection = await amqp.connect(cfg.url);
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
// ─── Reconnect ────────────────────────────────────────────────────────────────
const scheduleReconnect = (cfg) => {
    if (reconnectAttempts >= cfg.maxReconnectAttempts) {
        console.error("❌ Max reconnect attempts reached. Giving up.");
        return;
    }
    reconnectAttempts++;
    const delay = cfg.reconnectDelayMs * reconnectAttempts; // exponential-ish backoff
    console.log(`🔄 Reconnect attempt ${reconnectAttempts}/${cfg.maxReconnectAttempts} in ${delay}ms…`);
    setTimeout(() => connectRabbitMQ(cfg).catch(console.error), delay);
};
// ─── Accessors ────────────────────────────────────────────────────────────────
/**
 * Returns the active channel, throwing if unavailable.
 * Use this in your publishers/consumers instead of the raw variable.
 */
export const getChannel = () => {
    if (!channel)
        throw new Error("RabbitMQ channel is not available.");
    return channel;
};
export const getConnection = () => {
    if (!connection)
        throw new Error("RabbitMQ connection is not available.");
    return connection;
};
// ─── Graceful Shutdown ────────────────────────────────────────────────────────
export const disconnectRabbitMQ = async () => {
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
// Hook into process shutdown signals
process.once("SIGINT", disconnectRabbitMQ);
process.once("SIGTERM", disconnectRabbitMQ);
