// rabbitmq/producer.js
import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_URL = process.env.AMQP_URL;
const EXCHANGE = "user_events";

class RabbitMQProducer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async connect() {
    if (this.connection) return;

    try {
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createConfirmChannel();

      await this.channel.assertExchange(EXCHANGE, "topic", { durable: true });

      this.reconnectAttempts = 0;
      console.log("✅ RabbitMQ Producer connected (User Service)");

      this.connection.on("close", () => {
        console.warn("RabbitMQ connection closed → reconnecting...");
        this.reconnect();
      });
    } catch (err) {
      console.error("RabbitMQ connect error:", err);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max RabbitMQ reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this.connect();
    }, delay);
  }

  async publish(routingKey, payload) {
    if (!this.channel) await this.connect();

    const message = Buffer.from(JSON.stringify(payload));

    try {
      const confirmed = await this.channel.publish(
        EXCHANGE,
        routingKey,
        message,
        { persistent: true },
      );

      if (confirmed) {
        console.log(`📨 Published event: ${routingKey}`);
      } else {
        console.warn(`Event ${routingKey} was not confirmed by broker`);
      }
    } catch (err) {
      console.error(`Failed to publish ${routingKey}:`, err);
      throw err;
    }
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    console.log("RabbitMQ Producer closed gracefully");
  }
}

export const rabbitMQProducer = new RabbitMQProducer();
