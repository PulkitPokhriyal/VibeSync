import { WebSocketServer } from "ws";
import { handleCreateRoom } from "./handlers/createRoom.ts";
import { handleJoinRoom } from "./handlers/joinRoom.ts";
import { handleLeaveRoom } from "./handlers/leaveRoom.ts";
export function createWebSocketServer() {
  const wss = new WebSocketServer({ port: 3001 });

  wss.on("connection", (ws): void => {
    ws.on("message", async (message) => {
      try {
        const { event, payload } = JSON.parse(message.toString());
        if (event === "createRoom") {
          handleCreateRoom(ws, payload);
        } else if (event === "joinRoom") {
          handleJoinRoom(ws, payload);
        } else if (event === "leaveRoom") {
          handleLeaveRoom(ws, payload);
        }
      } catch (e) {
        ws.send(
          JSON.stringify({ event: "error", message: "Invalid JSON format" }),
        );
      }
    });
    ws.on("close", async (): Promise<void> => {
      console.log("Client disconnected");
    });

    console.log("WebSocket server running on ws://localhost:3001");
  });
}
