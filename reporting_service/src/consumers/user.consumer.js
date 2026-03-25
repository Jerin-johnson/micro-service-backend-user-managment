// rabbitmq/consumer.js
import amqp from "amqplib";
import dotenv from "dotenv";
import UserReport from "../models/userReport.model.js";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE = "user_events";
const ROUTING_KEY = "user.created";
const QUEUE_NAME = process.env.QUEUE_NAME || "user_report_queue";

let connection = null;
let channel = null;

async function connectRabbitMQ() {
  try {
    console.log("the rabbit mq url is ", RABBITMQ_URL);
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    // Assert queue and bind it to exchange with routing key
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    console.log(`✅ Reporting Service listening for ${ROUTING_KEY} events...`);

    // Consume messages
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("📥 Received event:", content);

          const { data } = content;

          // Save to reporting database
          const report = new UserReport({
            authUserId: data.authUserId,
            // userId: data.userId,
            email: data.email,
            name: data.name,
            role: data.role,
          });

          await report.save();

          console.log(`✅ User report saved for ${data.email}`);

          // Acknowledge the message (important!)
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Error processing message:", error);
          // Reject message and requeue (or send to dead letter queue later)
          channel.nack(msg, false, true); // requeue = true
        }
      }
    });
  } catch (err) {
    console.error("RabbitMQ Connection Failed:", err);
    setTimeout(connectRabbitMQ, 5000); // retry after 5 seconds
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
  console.log("Reporting Service shutdown gracefully");
  process.exit(0);
});

export default connectRabbitMQ;
