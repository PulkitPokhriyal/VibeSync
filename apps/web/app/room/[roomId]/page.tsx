"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@repo/ui/input";
import { SendIcon } from "../../../icons/SendIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import { LogoutModal } from "../../../components/LogoutModal";
import { SpotifyLogic } from "../../../components/SpotifyLogic";
import { useSocket } from "../../../lib/WebSocketContext";
import Sidebar from "../../../components/Sidebar";
import { VotingModal } from "../../../components/VotingModal";
export default function RoomPage({ params }: { params: { roomId: string } }) {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    [],
  );
  const [inputMessage, setInputMessage] = useState("");
  const { roomId } = params;
  const [username, setUsername] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [voteRequestData, setVoteRequestData] = useState(null);
  const [musicQueue, setMusicQueue] = useState([]);
  const { sendSocketMessage, socket, isConnected } = useSocket();
  const [currentTrack, setCurrentTrack] = useState(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("roomId", roomId);
    }
  }, [roomId]);

  const fetchUserCount = async () => {
    await sendSocketMessage({
      event: "user_count",
      payload: {},
    });
  };

  const handleSendMessage = async () => {
    try {
      if (isConnected) {
        await sendSocketMessage({
          event: "chat",
          payload: {
            message: inputMessage,
          },
        });
        if (inputMessage) {
          setInputMessage("");
        }
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  useEffect(() => {
    if (isConnected) {
      fetchUserCount();
      function handleMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);
        console.log(typeof data);
        if (!data.event) return;

        switch (data.event) {
          case "chat":
            setMessages((prev) => [
              ...prev,
              { text: data.message, sender: data.username },
            ]);
            break;
          case "user_count":
            setCount(data.count);
            break;
          case "userLeft":
            setMessages((prev) => [
              ...prev,
              {
                text: `${data.username} left the chat`,
                sender: "system",
              },
            ]);
            break;
          case "userJoined":
            setMessages((prev) => [
              ...prev,
              {
                text: `${data.username} joined the chat`,
                sender: "system",
              },
            ]);

            break;
          case "vote-request":
            setVoteRequestData(data.track);
            break;
          case "music-queue":
            const parsedQueue = data.payload
              .map((item) => JSON.parse(item))
              .sort((a, b) => b.votes - a.votes);
            setMusicQueue(parsedQueue);
            break;
          case "currentTrack":
            setCurrentTrack(data.payload);
            break;
          default:
            console.warn("Unknown message type:", data.type);
        }
      }

      socket?.addEventListener("message", handleMessage);

      return () => {
        socket?.removeEventListener("message", handleMessage);
      };
    }
  }, [isConnected]);

  return (
    <div className="h-screen mx-10 lg:mx-20 overflow-hidden">
      <div className="mt-10 rounded-lg glassmorphism py-2 px-5 text-white flex justify-between">
        <h1 className="font-bold text-xl text-yellow-300">VIBESYNC</h1>
        <p>RoomId : {roomId}</p>
      </div>
      <div className="pt-8 rounded-lg flex h-[82.5dvh] gap-3 justify-between">
        <Sidebar>
          <div className="flex flex-col justify-start lg:hidden">
            <div
              className=" py-2 px-4 bg-white/10 shadow-lg
 flex justify-between text-white rounded-lg mb-2"
            >
              <p>{`Users in Room: ${count}`}</p>
              <button onClick={() => setOpen(true)}>
                <LogoutIcon sx={{ color: "#b91c1c" }} />
              </button>
              {open && <LogoutModal onClose={() => setOpen(false)} />}
            </div>
            <div className="glassmorphism rounded-lg">
              <SpotifyLogic
                musicQueue={musicQueue}
                currentTrack={currentTrack}
              />
            </div>
          </div>
        </Sidebar>
        <div className="lg:flex flex-col w-[320px] justify-start hidden">
          <div
            className=" py-2 px-4 bg-white/10 shadow-lg
 flex justify-between text-white rounded-lg mb-2"
          >
            <p>{`Users in Room: ${count}`}</p>
            <button onClick={() => setOpen(true)}>
              <LogoutIcon sx={{ color: "#b91c1c" }} />
            </button>
            {open && <LogoutModal onClose={() => setOpen(false)} />}
          </div>
          <div className="glassmorphism rounded-lg h-full overflow-hidden">
            <SpotifyLogic musicQueue={musicQueue} currentTrack={currentTrack} />
          </div>
        </div>

        <div className="glassmorphism rounded-lg flex flex-col justify-end lg:w-[68vw] w-full">
          <div className="overflow-y-scroll scroll-smooth">
            {messages.map((msg, index) =>
              msg.sender === "system" ? (
                <div
                  key={index}
                  className="text-center text-sm text-gray-300 my-2"
                >
                  {msg.text}
                </div>
              ) : msg.sender === username ? (
                <div key={index} className="m-2 flex flex-col items-end">
                  <span className="text-xs text-gray-300 mb-1">You</span>
                  <p className="border max-w-[30%] bg-white text-black break-words rounded-lg p-2 shadow">
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div key={index} className="m-2 flex flex-col items-start">
                  <span className="text-xs text-gray-300 mb-1">
                    {msg.sender}
                  </span>
                  <p className="border max-w-[30%] bg-white text-black break-words rounded-lg p-2 shadow">
                    {msg.text}
                  </p>
                </div>
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              width="130vh"
              required={true}
              placeholder="Type a message ...."
            />
            <button
              className="pb-2"
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ""}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
      {voteRequestData && (
        <VotingModal
          voteRequestData={voteRequestData}
          onClose={() => setVoteRequestData(null)}
        />
      )}
    </div>
  );
}
