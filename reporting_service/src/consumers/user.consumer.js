import amqp from "amqplib";
import UserReport from "../models/userReport.model.js";

export const consumeUserEvents = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "user_events";

  await channel.assertQueue(queue);

  channel.consume(queue, async (msg) => {
    const event = JSON.parse(msg.content.toString());

    if (event.type === "user.created") {
      await UserReport.create({
        userId: event.data.id,
        role: event.data.role,
        createdAt: event.data.createdAt,
      });
    }

    channel.ack(msg);
  });
};
