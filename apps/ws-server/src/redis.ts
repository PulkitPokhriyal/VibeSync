import { createClient, RedisClientType } from "redis";

export const redis: RedisClientType = createClient({
  url: "redis://localhost:6379",
});

export async function connectRedis() {
  redis.on("error", (err) => console.error("Redis Error:", err));
  await redis.connect();
  console.log("Connected to Redis");
}
