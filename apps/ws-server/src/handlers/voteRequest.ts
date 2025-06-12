import { WebSocket } from "ws";

interface Spotifytrack {
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
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const { username, roomId } = userInfo;

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
