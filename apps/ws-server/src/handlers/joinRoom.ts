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
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) => {
  const { username, roomId, roomType } = payload;

  if (
    roomType !== "public" &&
    roomType !== "private" &&
    roomType !== "random"
  ) {
    ws.send(JSON.stringify({ event: "error", message: "Invalid room type" }));
    return;
  }
  if (!username || !username.trim()) {
    ws.send(JSON.stringify({ event: "error", message: "Username required" }));
    return;
  }
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
    const music = await redis.LRANGE(`musicQueue:${roomId}`, 0, -1);
    const currentTrack = await redis.get(`currentTrack:${roomId}`);
    await redis.SADD(`roomUsers:${roomId}`, username);
    userConnections.set(ws, { username, roomId });
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          event: "currentTrack",
          payload: currentTrack,
        }),
      );
    }, 2000);

    for (const [client, info] of userConnections.entries()) {
      if (info.roomId === roomId) {
        client.send(JSON.stringify({ event: "userJoined", username, roomId }));
        setTimeout(() => {
          client.send(
            JSON.stringify({
              event: "music-queue",
              payload: music,
            }),
          );
        }, 2000);
      }
    }
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
    if (await checkUserExists(roomId, username, ws)) return;
    const music = await redis.LRANGE(`musicQueue:${roomId}`, 0, -1);
    const currentTrack = await redis.get(`currentTrack:${roomId}`);
    await redis.SADD(`roomUsers:${roomId}`, username);
    userConnections.set(ws, { username, roomId });
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          event: "currentTrack",
          payload: currentTrack,
        }),
      );
    }, 2000);

    for (const [client, info] of userConnections.entries()) {
      if (info.roomId === roomId) {
        client.send(JSON.stringify({ event: "userJoined", username, roomId }));
        setTimeout(() => {
          client.send(
            JSON.stringify({
              event: "music-queue",
              payload: music,
            }),
          );
        }, 2000);
      }
    }
  } else if (roomType === "random") {
    const roomId = await redis.sRandMember("publicRooms");
    const music = await redis.LRANGE(`musicQueue:${roomId}`, 0, -1);
    const currentTrack = await redis.get(`currentTrack:${roomId}`);
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
    userConnections.set(ws, { username, roomId });
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          event: "currentTrack",
          payload: currentTrack,
        }),
      );
    }, 2000);

    for (const [client, info] of userConnections.entries()) {
      if (info.roomId === roomId) {
        client.send(JSON.stringify({ event: "userJoined", username, roomId }));
        setTimeout(() => {
          client.send(
            JSON.stringify({
              event: "music-queue",
              payload: music,
            }),
          );
        }, 1000);
      }
    }
  }
};
