import { WebSocket } from "ws";
import { Spotifytrack } from "./voteRequest.ts";
import { redis } from "../redis.ts";

export async function handleUpVote(
  ws: WebSocket,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
  voteState: Map<string, { track: Spotifytrack; votes: number }>,
) {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const totalUsers = await redis.sCard(`roomUsers:${userInfo.roomId}`);
  const { username, roomId } = userInfo;
  const sessionVote = voteState.get(roomId);
  if (!sessionVote) return;
  voteState.set(roomId, {
    track: sessionVote.track,
    votes: sessionVote.votes + 1,
  });
  if (sessionVote.votes === 0) {
    setTimeout(async () => {
      const finalVotes = voteState.get(roomId);
      if (!finalVotes) return;
      if (finalVotes && finalVotes.votes >= totalUsers / 2) {
        await redis.SADD(`musicQueue:${roomId}`, JSON.stringify(finalVotes));
      }
      voteState.delete(roomId);
      const music = await redis.SMEMBERS(`musicQueue:${roomId}`);
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
}
