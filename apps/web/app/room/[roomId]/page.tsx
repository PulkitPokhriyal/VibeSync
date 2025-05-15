"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { SendIcon } from "../../../icons/SendIcon";
import { sendSocketMessage, connectSocket } from "../../../lib/websocket";
export default function RoomPage({ params }) {
  const sendMessage = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    [],
  );
  const [username, setUsername] = useState("");
  const handleSendMessage = async () => {
    try {
      await sendSocketMessage({
        event: "chat",
        payload: {
          message: sendMessage.current?.value,
        },
      });
      if (sendMessage.current) {
        sendMessage.current.value = "";
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

    function handleMessage(event) {
      const data = JSON.parse(event.data);
      if (data.message && data.username) {
        setMessages((prev) => [
          ...prev,
          { text: data.message, sender: data.username },
        ]);
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
            <p>Total people in Room: 10</p>
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
              ref={sendMessage}
              className="w-[58vw]"
              required={true}
              placeholder="Type a message ...."
            />
            <button className="pb-1" onClick={handleSendMessage}>
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
