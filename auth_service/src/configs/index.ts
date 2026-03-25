// // src/config/index.ts
// import { z } from "zod";
// import dotenv from "dotenv";

// dotenv.config();

// const envSchema = z.object({
//   NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
//   PORT: z.coerce.number().default(3001),
//   JWT_SECRET: z.string().min(32),
//   DATABASE_URL: z.string().url(),
//   USER_SERVICE_GRPC_URL: z.string().default("localhost:50051"),
//   RABBITMQ_URL: z.string().default("amqp://guest:guest@localhost:5672"),
//   USER_CREATED_TOPIC: z.string().default("user.created"),
// });

// const config = envSchema.parse(process.env);

// export default config;
// export type Config = typeof config;
