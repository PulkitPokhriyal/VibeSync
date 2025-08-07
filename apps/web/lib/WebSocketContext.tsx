"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type SocketEvent = {
  event: string;
  payload: any;
};

type SocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
  sendSocketMessage: ({ event, payload }: SocketEvent) => Promise<any>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  const connectSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
      return;

    const socket = new WebSocket("wss://vibesync-kubj.onrender.com");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    socket.onclose = () => {
      console.log(" WebSocket disconnected. Attempting reconnect in 1s...");
      setIsConnected(false);
      setTimeout(connectSocket, 1000);
    };

    socket.onerror = (err) => {
      console.error(" WebSocket error:", err);
    };

    socket.onmessage = (message) => {
      console.log(" Received:", message.data);
    };

    socketRef.current = socket;
  };

  const sendSocketMessage = ({ event, payload }: SocketEvent) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return reject(new Error("WebSocket not connected"));
      }

      const message = JSON.stringify({ event, payload });
      socket.send(message);

      const handleMessage = (msg: MessageEvent) => {
        try {
          const data = JSON.parse(msg.data);
          resolve(data);
        } catch (err) {
          reject(new Error("Invalid JSON from server: " + err));
        } finally {
          socket.removeEventListener("message", handleMessage);
        }
      };

      socket.addEventListener("message", handleMessage);
    });
  };

  const disconnectSocket = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setIsConnected(false);
  };

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isConnected, sendSocketMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used inside a SocketProvider");
  return context;
};
