import { WebSocket } from "ws";

import { redis } from "../redis.ts";
export interface Spotifytrack {
  id: string;
  name: string;
  duration: number;
  album: {
    images: { url: string; height: number; width: number }[];
    name: string;
  };
  artists: { name: string }[];
}

export async function handleVoteRequest(
  ws: WebSocket,
  payload: Spotifytrack,
  voteState: Map<string, { track: Spotifytrack; votes: number }>,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const { username, roomId } = userInfo;

  const totalUsers = await redis.sCard(`roomUsers:${userInfo.roomId}`);
  voteState.set(roomId, {
    track: payload,
    votes: 0,
  });

  for (const [client, info] of userConnections.entries()) {
    if (info.roomId === roomId && info.username !== username) {
      client.send(
        JSON.stringify({
          event: "vote-request",
          track: {
            track: payload,
            requestedBy: username,
          },
        }),
      );
    }
  }
  setTimeout(async () => {
    const finalVotes = voteState.get(roomId);
    if (!finalVotes) return;
    if (finalVotes && finalVotes.votes >= totalUsers / 2) {
      await redis.RPUSH(`musicQueue:${roomId}`, JSON.stringify(finalVotes));
    }
    voteState.delete(roomId);
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
  }, 10000);
}
