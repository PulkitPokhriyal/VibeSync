import { WebSocket } from "ws";
import { Spotifytrack } from "./voteRequest.ts";

export async function handleUpVote(
  ws: WebSocket,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
  voteState: Map<string, { track: Spotifytrack; votes: number }>,
) {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const { username, roomId } = userInfo;
  const sessionVote = voteState.get(roomId);
  if (!sessionVote) return;
  voteState.set(roomId, {
    track: sessionVote.track,
    votes: sessionVote.votes + 1,
  });
}
