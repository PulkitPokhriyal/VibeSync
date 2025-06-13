import { WebSocket } from "ws";

export interface Spotifytrack {
  id: string;
  name: string;
  album: {
    images: { url: string; height: number; width: number }[];
    name: string;
  };
  artists: { name: string }[];
}

export function handleVoteRequest(
  ws: WebSocket,
  payload: Spotifytrack,
  voteState: Map<string, { track: Spotifytrack; votes: number }>,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const { username, roomId } = userInfo;

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
            payload,
            requestedBy: username,
          },
        }),
      );
    }
  }
}
