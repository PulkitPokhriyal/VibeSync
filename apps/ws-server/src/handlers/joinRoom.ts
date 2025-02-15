import { redis } from "../redis.ts";
import WebSocket from "ws";

type joinRoomPayload = {
  username: string;
  roomId?: string;
  roomType: "public" | "private" | "random";
};

const checkUserExists = async (
  roomId: string,
  username: string,
  ws: WebSocket,
) => {
  const isUserInRoom = await redis.SISMEMBER(`roomUsers:${roomId}`, username);
  if (isUserInRoom) {
    ws.send(
      JSON.stringify({
        event: "error",
        message: "User with this username already in room",
      }),
    );
    return true;
  }
  return false;
};

export const handleJoinRoom = async (
  ws: WebSocket,
  payload: joinRoomPayload,
) => {
  const { username, roomId, roomType } = payload;
  if (roomType === "public") {
    if (!roomId) {
      ws.send(JSON.stringify({ event: "error", message: "Room ID required" }));
      return;
    }
    const roomExists = await redis.SISMEMBER("publicRooms", roomId);
    if (!roomExists) {
      ws.send(JSON.stringify({ event: "error", message: "Room not found" }));
      return;
    }
    if (await checkUserExists(roomId, username, ws)) return;
    await redis.SADD(`roomUsers:${roomId}`, username);
    ws.send(JSON.stringify({ event: "roomJoined", roomType, roomId }));
  } else if (roomType === "private") {
    if (!roomId) {
      ws.send(JSON.stringify({ event: "error", message: "Room ID required" }));
      return;
    }
    const roomExists = await redis.SISMEMBER("privateRooms", roomId);
    if (!roomExists) {
      ws.send(JSON.stringify({ event: "error", message: "Room not found" }));
      return;
    }
    await checkUserExists(roomId, username, ws);
    await redis.SADD(`roomUsers:${roomId}`, username);
    ws.send(JSON.stringify({ event: "roomJoined", roomType, roomId }));
  } else if (roomType === "random") {
    const roomId = await redis.sRandMember("publicRooms");
    if (!roomId) {
      ws.send(
        JSON.stringify({
          event: "error",
          message: "No public rooms available",
        }),
      );
      return;
    }
    if (await checkUserExists(roomId, username, ws)) return;
    await redis.SADD(`roomUsers:${roomId}`, username);
    ws.send(
      JSON.stringify({
        event: "roomJoined",
        roomType: "public",
        roomId: roomId,
      }),
    );
  }
};
