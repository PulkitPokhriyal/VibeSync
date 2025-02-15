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
) {
  const roomId = uuidv4();
  const { username, roomType } = payload;
  if (roomType === "private") {
    await redis.SADD("privateRooms", roomId);
  } else if (roomType === "public") {
    await redis.SADD("publicRooms", roomId);
  }
  await redis.SADD(`roomUsers:${roomId}`, username);
  ws.send(JSON.stringify({ event: "roomCreated", roomId, roomType, username }));
}
