import { createWebSocketServer } from "./server.ts";
import { connectRedis } from "./redis.ts";

(async () => {
  await connectRedis();
  createWebSocketServer();
})();
