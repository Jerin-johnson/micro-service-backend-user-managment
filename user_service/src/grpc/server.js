import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { createUser } from "../services/user.service.js";
import { fileURLToPath } from "url";

// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, "../proto/user.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Implement the service
const userServiceImpl = {
  CreateUser: async (call, callback) => {
    try {
      const { auth_user_id, email, name, role } = call.request;

      console.log(`Received CreateUser request for email: ${email}`);

      const result = await createUser({
        authUserId: auth_user_id,
        email,
        name,
        role,
      });

      callback(null, {
        user_id: result.userId,
        success: true,
        message: "User created successfully in User Service",
      });
    } catch (error) {
      console.error("Error in CreateUser:", error);
      callback(null, {
        user_id: 0,
        success: false,
        message: error.message || "Failed to create user",
      });
    }
  },
};

// Start gRPC Server
const startGrpcServer = () => {
  const server = new grpc.Server();

  server.addService(userProto.UserService.service, userServiceImpl);

  const PORT = process.env.GRPC_PORT || "50051";

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind gRPC server:", err);
        return;
      }
      console.log(`🚀 User gRPC Server running on port ${port}`);
      server.start();
    },
  );
};

export default startGrpcServer;
