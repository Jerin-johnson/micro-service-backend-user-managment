// rabbitmq/consumer.js
import amqp from "amqplib";
import dotenv from "dotenv";
import UserReport from "../models/userReport.model.js";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE = "user_events";
// const ROUTING_KEY = "user.created";
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
    const routingKeys = [
      "user.created",
      "user.updated",
      "user.deactivated",
      "user.deleted",
    ];

    for (const key of routingKeys) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE, key);
      console.log(`📌 Bound routing key: ${key} → queue: ${QUEUE_NAME}`);
    }

    console.log(
      "✅ Reporting Service Consumer started - listening to all user events",
    );

    console.log(`✅ Reporting Service listening for ${routingKeys} events...`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const { event, data } = content;

        console.log(`📥 Reporting received: ${event}`);

        switch (event) {
          case "user.created":
            const report = new UserReport({
              authUserId: data.authUserId,
              // userId: data.userId,
              email: data.email,
              name: data.name,
              role: data.role,
            });

            await report.save();
            console.log(`✅ User report saved for ${data.email}`);
            break;
          case "user.updated":
            await UserReport.findOneAndUpdate(
              { authUserId: data.authUserId },
              {
                email: data.email,
                name: data.name,
                role: data.role,
                isActive: data.isActive !== undefined ? data.isActive : true,
              },
              { upsert: true, new: true },
            );
            break;

          case "user.deactivated":
            await UserReport.findOneAndUpdate(
              { authUserId: data.authUserId },
              { isActive: data.isActive },
            );
            break;

          case "user.deleted":
            await UserReport.findOneAndUpdate(
              { authUserId: data.authUserId },
              { isActive: false },
            );
            break;
        }

        channel.ack(msg);
      } catch (error) {
        console.error("Error in Reporting Consumer:", error);
        channel.nack(msg, false, true);
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
