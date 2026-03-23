import amqp, { ChannelModel, Channel, Options } from "amqplib";

// ─── Config ───────────────────────────────────────────────────────────────────

interface RabbitMQConfig {
  url: string;
  reconnectDelayMs?: number;
  maxReconnectAttempts?: number;
}

const DEFAULT_CONFIG: Required<RabbitMQConfig> = {
  url: process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
  reconnectDelayMs: 5000,
  maxReconnectAttempts: 10,
};

// ─── State ────────────────────────────────────────────────────────────────────

let connection: ChannelModel | null = null; // ✅ ChannelModel, not Connection
let channel: Channel | null = null;
let reconnectAttempts = 0;
let isConnecting = false;

// ─── Core ─────────────────────────────────────────────────────────────────────

export const connectRabbitMQ = async (
  config: RabbitMQConfig,
): Promise<{ connection: ChannelModel; channel: Channel }> => {
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

    connection.on("error", (err: Error) => {
      console.error("❌ RabbitMQ connection error:", err.message);
    });

    channel = await connection.createChannel();

    channel.on("close", () => {
      console.warn("⚠️  RabbitMQ channel closed.");
      channel = null;
    });

    channel.on("error", (err: Error) => {
      console.error("❌ RabbitMQ channel error:", err.message);
    });

    console.log("✅ RabbitMQ connected successfully.");
    return { connection, channel };
  } finally {
    isConnecting = false;
  }
};

// ─── Reconnect ────────────────────────────────────────────────────────────────

const scheduleReconnect = (cfg: Required<RabbitMQConfig>): void => {
  if (reconnectAttempts >= cfg.maxReconnectAttempts) {
    console.error("❌ Max reconnect attempts reached. Giving up.");
    return;
  }

  reconnectAttempts++;
  const delay = cfg.reconnectDelayMs * reconnectAttempts; // exponential-ish backoff

  console.log(
    `🔄 Reconnect attempt ${reconnectAttempts}/${cfg.maxReconnectAttempts} in ${delay}ms…`,
  );

  setTimeout(() => connectRabbitMQ(cfg).catch(console.error), delay);
};

// ─── Accessors ────────────────────────────────────────────────────────────────

/**
 * Returns the active channel, throwing if unavailable.
 * Use this in your publishers/consumers instead of the raw variable.
 */
export const getChannel = (): Channel => {
  if (!channel) throw new Error("RabbitMQ channel is not available.");
  return channel;
};

export const getConnection = (): ChannelModel => {
  if (!connection) throw new Error("RabbitMQ connection is not available.");
  return connection;
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

export const disconnectRabbitMQ = async (): Promise<void> => {
  try {
    await channel?.close();
    await connection?.close();
    console.log("✅ RabbitMQ disconnected gracefully.");
  } catch (err) {
    console.error("❌ Error during RabbitMQ disconnect:", err);
  } finally {
    channel = null;
    connection = null;
  }
};

// Hook into process shutdown signals
process.once("SIGINT", disconnectRabbitMQ);
process.once("SIGTERM", disconnectRabbitMQ);
