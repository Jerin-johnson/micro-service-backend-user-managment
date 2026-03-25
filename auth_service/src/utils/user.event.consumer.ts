// src/consumers/user.events.consumer.ts
import amqp, {
  Channel,
  ChannelModel,
  Connection,
  ConsumeMessage,
} from "amqplib";
import dotenv from "dotenv";
import * as repo from "../repositories/auth.repository.js";

dotenv.config();

interface UserEventData {
  authUserId: string;
  role?: string;
  isActive?: boolean;
  email?: string;
}

interface EventMessage {
  event: string;
  data: UserEventData;
}

type EventHandler = (data: UserEventData) => Promise<void>;

const RABBITMQ_URL =
  process.env.AMQP_URL || process.env.RABBITMQ_URL || "amqp://localhost";
const EXCHANGE = "user_events";
const QUEUE_NAME = "auth_service_queue";

const ROUTING_KEYS = [
  "user.updated",
  "user.deactivated",
  "user.deleted",
] as const;

// ============================================================================
// STATE
// ============================================================================

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

// ============================================================================
// CONNECTION
// ============================================================================

export async function connectConsumer(): Promise<void> {
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL);
    console.log("✅ Connected to RabbitMQ");

    // Create channel
    channel = await connection.createChannel();

    // Set prefetch to process one message at a time
    // await channel.prefetch(1);

    // Assert exchange exists (idempotent)
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    // Assert queue exists
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Bind queue to routing keys
    for (const routingKey of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE, routingKey);
      console.log(`📌 Bound queue to: ${routingKey}`);
    }

    console.log(
      `✅ Auth Service Consumer started - listening for user events on queue: ${QUEUE_NAME}`,
    );

    // Start consuming messages
    await channel.consume(QUEUE_NAME, handleMessage, { noAck: false });

    // Handle connection errors
    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err);
      reconnect();
    });

    connection.on("close", () => {
      console.warn("⚠️  RabbitMQ connection closed");
      reconnect();
    });
  } catch (err) {
    console.error("❌ RabbitMQ Consumer Error (Auth):", err);
    reconnect();
  }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

async function handleMessage(msg: ConsumeMessage | null): Promise<void> {
  if (!msg || !channel) return;

  try {
    // Parse message
    const content: EventMessage = JSON.parse(msg.content.toString());
    const { event, data } = content;

    console.log(`📥 Auth Service received event: ${event}`, data);

    // Route to appropriate handler
    const handler = eventHandlers[event];

    if (handler) {
      await handler(data);
    } else {
      console.warn(`⚠️  Unknown event: ${event}`);
    }

    // Acknowledge successful processing
    channel.ack(msg);
  } catch (error) {
    console.error("❌ Error processing event in Auth Service:", error);

    // Reject and requeue the message for retry
    // Set requeue=false after implementing dead letter queue
    if (channel) {
      channel.nack(msg, false, true);
    }
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const eventHandlers: Record<string, EventHandler> = {
  "user.updated": handleUserUpdated,
  "user.deactivated": handleUserDeactivated,
  "user.deleted": handleUserDeleted,
};

async function handleUserUpdated(data: UserEventData): Promise<void> {
  await repo.updateAuthUser(Number(data.authUserId), {
    role: data.role,
    isActive: data.isActive,
    email: data.email,
  });
  console.log(`✅ Auth DB updated for user ${data.authUserId}`);
}

async function handleUserDeactivated(data: UserEventData): Promise<void> {
  await repo.updateAuthUser(Number(data.authUserId), {
    isActive: data.isActive,
  });
  console.log(`✅ User ${data.authUserId} deactivated in Auth DB`);
}

async function handleUserDeleted(data: UserEventData): Promise<void> {
  // Decide: hard delete or soft delete
  await repo.deleteUser(Number(data.authUserId));
  console.log(`✅ User ${data.authUserId} deleted from Auth DB`);
}

// ============================================================================
// RECONNECTION
// ============================================================================

function reconnect(): void {
  console.log("🔄 Attempting to reconnect in 5 seconds...");
  setTimeout(() => {
    connectConsumer().catch((err) => {
      console.error("❌ Reconnection failed:", err);
    });
  }, 5000);
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

export async function disconnectConsumer(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      console.log("✅ Channel closed");
    }
    if (connection) {
      await connection.close();
      console.log("✅ Connection closed");
    }
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
  }
}

// Setup graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏸️  Shutting down Auth Consumer gracefully...");
  await disconnectConsumer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏸️  Shutting down Auth Consumer gracefully...");
  await disconnectConsumer();
  process.exit(0);
});
