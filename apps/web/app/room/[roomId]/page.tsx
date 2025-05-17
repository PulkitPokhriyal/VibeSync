"use client";

import { useEffect, useRef, useState, use } from "react";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { SendIcon } from "../../../icons/SendIcon";
import { sendSocketMessage, connectSocket } from "../../../lib/websocket";
export default function RoomPage({ params }) {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    [],
  );
  const [inputMessage, setInputMessage] = useState("");
  const { roomId } = use(params);
  const [username, setUsername] = useState("");
  const [count, setCount] = useState(0);
  const handleSendMessage = async () => {
    try {
      await sendSocketMessage({
        event: "chat",
        payload: {
          message: inputMessage,
        },
      });
      if (inputMessage) {
        setInputMessage("");
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  useEffect(() => {
    const socket = connectSocket();
    const fetchUserCount = async () => {
      await sendSocketMessage({
        event: "user_count",
        payload: {},
      });
    };
    fetchUserCount();
    function handleMessage(event: MessageEvent) {
      const data = JSON.parse(event.data);
      if (!data.type) return;

      switch (data.type) {
        case "chat":
          setMessages((prev) => [
            ...prev,
            { text: data.message, sender: data.username },
          ]);
          break;
        case "user_count":
          setCount(data.count);
          break;
        default:
          console.warn("Unknown message type:", data.type);
      }
    }

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <div className="mt-10 mx-20 border border-blue-900 rounded-t-lg py-2 px-10 bg-sky-400 text-white flex justify-between">
        <h1 className="font-bold text-xl">VIBESYNC</h1>
        <p>Now Playing</p>
      </div>
      <div className="border border-blue-900 mx-20 pt-8 rounded-b-lg h-[42vw] flex ">
        <div>
          <div className=" py-2 px-4 border border-blue-900 text-white bg-sky-400 rounded-t-lg mx-10">
            <p>{`Total people in Room: ${count}`}</p>
          </div>
          <div className="border border-blue-900 mx-10 h-[35vw] w-[20vw] rounded-b-lg ">
            <p className="text-md font-semibold pt-4 pl-4">Music Queue</p>
          </div>
        </div>
        <div className="border border-blue-900 rounded-lg flex flex-col h-[37.8vw] w-[62vw]">
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`m-2 flex flex-col ${msg.sender === username ? "items-end" : "items-start"}`}
              >
                <span className="text-xs text-gray-500 mb-1">
                  {msg.sender === username ? "You" : msg.sender}
                </span>
                <p className="border max-w-[30%] bg-white text-black break-words rounded-lg p-2 shadow">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-[58vw]"
              required={true}
              placeholder="Type a message ...."
            />
            <button
              className="pb-1"
              onClick={handleSendMessage}
              disabled={!inputMessage}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
