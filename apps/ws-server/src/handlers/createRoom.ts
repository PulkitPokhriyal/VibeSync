import { redis } from "../redis.ts";
import { WebSocket } from "ws";
import crypto from "crypto";
type CreateRoomPayload = {
  username: string;
  roomType: "public" | "private";
};

function generateRoomId(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}
export async function handleCreateRoom(
  ws: WebSocket,
  payload: CreateRoomPayload,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const roomId = generateRoomId();
  const { username, roomType } = payload;
  if (!username || !username.trim()) {
    ws.send(JSON.stringify({ event: "error", message: "Username required" }));
    return;
  }
  if (roomType !== "public" && roomType !== "private") {
    ws.send(JSON.stringify({ event: "error", message: "Invalid room type" }));
    return;
  }
  const userInfo = userConnections.get(ws);
  if (userInfo) {
    ws.send(
      JSON.stringify({ event: "error", message: "User already in a room" }),
    );
    return;
  }

  if (roomType === "private") {
    await redis.SADD("privateRooms", roomId);
  } else if (roomType === "public") {
    await redis.SADD("publicRooms", roomId);
  }
  await redis.SADD(`roomUsers:${roomId}`, username);
  userConnections.set(ws, { username, roomId });
  ws.send(JSON.stringify({ event: "roomCreated", roomId, roomType, username }));
}
