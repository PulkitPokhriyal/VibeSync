let socket: WebSocket | null = null;

export function connectSocket() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = new WebSocket("ws://localhost:3001");
  }

  socket.onopen = () => {
    console.log("Connected to WebSocket server");
  };

  socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onmessage = (message) => {
    console.log("Received:", message.data);
  };

  return socket;
}

export function sendSocketMessage({ event, payload }) {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, payload }));
      const handleMessage = (MessageEvent) => {
        try {
          const data = JSON.parse(MessageEvent.data);
          if (data.roomId) {
            resolve(data);
          } else {
            reject(new Error("No roomId received from the server"));
          }
        } catch (err) {
          reject(new Error("Invalid JSON from server"));
        } finally {
          socket.removeEventListener("message", handleMessage);
        }
      };
      socket.addEventListener("message", handleMessage);
    } else {
      reject(new Error("socket is not open"));
    }
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
