// src/clients/grpc/user.client.ts
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
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

const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;
const USER_SERVICE_GRPC_URL =
  process.env.USER_SERVICE_GRPC_URL || "localhost:50051";

class UserGrpcClient {
  private client: any;

  constructor() {
    this.client = new userProto.UserService(
      USER_SERVICE_GRPC_URL,
      grpc.credentials.createInsecure(),
    );
    // logger.info(`gRPC client connected to ${USER_SERVICE_GRPC_URL}`);
  }

  async createUser(request: {
    authUserId: number;
    email: string;
    name: string;
    role: string;
  }): Promise<{ userId: number; success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      this.client.CreateUser(request, (err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }
}

export const userGrpcClient = new UserGrpcClient();
