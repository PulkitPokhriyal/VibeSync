import { WebSocketServer, WebSocket } from "ws";
import { handleCreateRoom } from "./handlers/createRoom.ts";
import { handleJoinRoom } from "./handlers/joinRoom.ts";
import { handleLeaveRoom } from "./handlers/leaveRoom.ts";
import { handleMessage } from "./handlers/messageHandler.ts";
import { handleUserCount } from "./handlers/userCount.ts";
export function createWebSocketServer() {
  const wss = new WebSocketServer({ port: 3001 });

  const userConnections = new Map<
    WebSocket,
    { username: string; roomId: string }
  >();

  wss.on("connection", (ws): void => {
    ws.on("message", async (message) => {
      try {
        const { event, payload } = JSON.parse(message.toString());
        if (event === "create") {
          handleCreateRoom(ws, payload, userConnections);
        } else if (event === "join") {
          handleJoinRoom(ws, payload, userConnections);
        } else if (event === "leaveRoom") {
          handleLeaveRoom(ws, userConnections);
        } else if (event === "chat") {
          handleMessage(ws, payload, userConnections);
        } else if (event === "user_count") {
          handleUserCount(ws, userConnections);
        }
      } catch (e) {
        ws.send(
          JSON.stringify({ event: "error", message: "Invalid JSON format" }),
        );
      }
    });
    ws.on("close", async (): Promise<void> => {
      console.log("Client disconnected");
      const userInfo = userConnections.get(ws);
      if (userInfo) {
        await handleLeaveRoom(ws, userConnections);
      }
    });

    console.log("WebSocket server running on ws://localhost:3001");
  });
}
