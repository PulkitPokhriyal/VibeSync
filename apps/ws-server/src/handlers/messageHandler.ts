import { WebSocket } from "ws";

type messagePayload = {
  message: string;
};

export const handleMessage = (
  ws: WebSocket,
  payload: messagePayload,
  userConnections: Map<WebSocket, { username: string; roomId: string }>,
) => {
  const userInfo = userConnections.get(ws);
  if (!userInfo) return;
  const { username, roomId } = userInfo;
  for (const [client, info] of userConnections.entries()) {
    if (info.roomId === roomId) {
      client.send(
        JSON.stringify({
          event: "chat",
          username,
          message: payload.message,
        }),
      );
    }
  }
};
