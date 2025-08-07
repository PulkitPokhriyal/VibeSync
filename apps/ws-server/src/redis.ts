import { createClient, RedisClientType } from "redis";

export const redis: RedisClientType = createClient({
  url: process.env.REDIS_URL,
});

export async function connectRedis() {
  redis.on("error", (err) => console.error("Redis Error:", err));
  await redis.connect();
  console.log("Connected to Redis");
}
