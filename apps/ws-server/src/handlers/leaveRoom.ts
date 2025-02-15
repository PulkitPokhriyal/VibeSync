import { WebSocket } from "ws";
import { redis } from "../redis.ts";

type LeaveRoomPayload = {
  username: string;
  roomId: string;
  roomType: "public" | "private";
};

export const handleLeaveRoom = async (
  ws: WebSocket,
  payload: LeaveRoomPayload,
) => {
  const { username, roomId, roomType } = payload;
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
  const activeUsers = await redis.SMEMBERS(`roomUsers:${roomId}`);
  if (activeUsers.length === 0) {
    if (roomType === "public") {
      await redis.SREM("publicRooms", roomId);
    } else {
      await redis.SREM("privateRooms", roomId);
    }
  }
  ws.send(
    JSON.stringify({
      event: "userLeft",
      message: `${username} left the room`,
      roomId,
    }),
  );
};
