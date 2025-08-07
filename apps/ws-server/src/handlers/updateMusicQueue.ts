import { redis } from "../redis.ts";
import type WebSocket from "ws";
export async function updateMusicQueue(
  payload: any,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const { musicQueue, roomId } = payload;
  const duration = musicQueue.track.duration_ms;
  await redis.LREM(`musicQueue:${roomId}`, 0, JSON.stringify(musicQueue));
  await redis.set(
    `currentTrack:${roomId}`,
    JSON.stringify({
      currentTrack: musicQueue,
      startedAt: Date.now(),
    }),
    {
      EX: Math.ceil(duration / 1000),
    },
  );
  const music = await redis.LRANGE(`musicQueue:${roomId}`, 0, -1);
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
