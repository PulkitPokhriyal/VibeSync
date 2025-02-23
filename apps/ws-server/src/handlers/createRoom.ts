import { v4 as uuidv4 } from "uuid";
import { redis } from "../redis.ts";
import { WebSocket } from "ws";

type CreateRoomPayload = {
  username: string;
  roomType: "public" | "private";
};

export async function handleCreateRoom(
  ws: WebSocket,
  payload: CreateRoomPayload,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const roomId = uuidv4();
  const { username, roomType } = payload;
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
