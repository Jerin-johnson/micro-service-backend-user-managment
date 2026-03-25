import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

const RABBITMQ_URL = process.env.AMQP_URL as string;

console.log("the url is ", RABBITMQ_URL);

class RabbitMQProducer {
  private connection: amqp.ChannelModel | null = null; // ← FIXED HERE
  private channel: amqp.Channel | null = null;
  private readonly exchange = "user_events";
  private reconnectTimer?: NodeJS.Timeout;

  async connect(): Promise<void> {
    try {
      console.log("is everything okau", RABBITMQ_URL);
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createConfirmChannel();
      await this.channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });

      // Auto-reconnect on close
      this.connection.on("close", () => this.reconnect());
    } catch (err) {
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, 5000);
  }

  async publish(routingKey: string, payload: any): Promise<void> {
    if (!this.channel) await this.connect();

    const message = Buffer.from(JSON.stringify(payload));
    this.channel!.publish(this.exchange, routingKey, message, {
      persistent: true,
    });
  }
}

export const rabbitMQProducer = new RabbitMQProducer();
