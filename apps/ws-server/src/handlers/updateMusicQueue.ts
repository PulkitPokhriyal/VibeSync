import { redis } from "../redis.ts";
import type WebSocket from "ws";
export async function updateMusicQueue(
  payload: any,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const { musicQueue, roomId } = payload;
  await redis.SREM(`musicQueue:${roomId}`, JSON.stringify(musicQueue));
  const music = await redis.SMEMBERS(`musicQueue:${roomId}`);
  for (const [client, info] of userConnections.entries()) {
    if (info.roomId === roomId) {
      client.send(
        JSON.stringify({
          event: "music-queue",
          payload: music,
        }),
      );
    }
  }
}
