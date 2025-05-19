import { redis } from "../redis.ts";
import { WebSocket } from "ws";

export async function handleUserCount(
  ws: WebSocket,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const userInfo = userConnections.get(ws);

  if (!userInfo) return;
  const totalUsers = await redis.sCard(`roomUsers:${userInfo.roomId}`);
  for (const [client, info] of userConnections.entries()) {
    if (info.roomId === userInfo.roomId) {
      client.send(
        JSON.stringify({
          event: "user_count",
          count: totalUsers,
        }),
      );
    }
  }
}
