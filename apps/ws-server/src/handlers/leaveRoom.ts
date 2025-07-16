import { WebSocket } from "ws";
import { redis } from "../redis.ts";
import { handleUserCount } from "./userCount.ts";
export const handleLeaveRoom = async (
  ws: WebSocket,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) => {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const { username, roomId } = userInfo;
  const isUserInRoom = await redis.SISMEMBER(`roomUsers:${roomId}`, username);
  if (!isUserInRoom) {
    ws.send(
      JSON.stringify({
        event: "error",
        message: "User is not in the room",
      }),
    );
    return;
  }
  await redis.SREM(`roomUsers:${roomId}`, username);
  await handleUserCount(ws, userConnections);
  userConnections.delete(ws);
  const activeUsers = await redis.SMEMBERS(`roomUsers:${roomId}`);
  if (activeUsers.length === 0) {
    const isUserInPublicRoom = await redis.SISMEMBER("publicRooms", roomId);
    if (isUserInPublicRoom) {
      await redis.SREM("publicRooms", roomId);
    } else {
      await redis.SREM("privateRooms", roomId);
    }
    await redis.DEL(`musicQueue:${roomId}`);
  }
  for (const [client, info] of userConnections.entries()) {
    if (info.roomId === roomId) {
      client.send(JSON.stringify({ event: "userLeft", username }));
    }
  }
};
