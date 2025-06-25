"use client";

import { useEffect, useState, use } from "react";
import { Input } from "@repo/ui/input";
import { SendIcon } from "../../../icons/SendIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import { LogoutModal } from "../../../components/LogoutModal";
import { SpotifyLogic } from "../../../components/SpotifyLogic";
import { useSocket } from "../../../lib/WebSocketContext";

export default function RoomPage({ params }) {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    [],
  );
  const [inputMessage, setInputMessage] = useState("");
  const { roomId } = use(params);
  const [username, setUsername] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [voteRequestData, setVoteRequestData] = useState(null);
  const [musicQueue, setMusicQueue] = useState([]);
  const { sendSocketMessage, socket, isConnected } = useSocket();
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
    <div className="h-screen overflow-hidden">
      <div className="mt-10 mx-20 border border-blue-900 rounded-t-lg py-2 px-10 bg-sky-400 text-white flex justify-between">
        <h1 className="font-bold text-xl">VIBESYNC</h1>
        <p>Now Playing</p>
      </div>
      <div className="border border-blue-900 mx-20 pt-8 rounded-b-lg h-[42vw] flex ">
        <div>
          <div className=" py-2 px-4 border border-blue-900 flex gap-14  text-white bg-sky-400 rounded-t-lg mx-10">
            <p>{`Total people in Room: ${count}`}</p>
            <button onClick={() => setOpen(true)}>
              <LogoutIcon sx={{ color: "#b91c1c" }} />
            </button>
            {open && <LogoutModal onClose={() => setOpen(false)} />}
          </div>
          <div className="border border-blue-900 mx-10 h-[35vw] w-[20vw] rounded-b-lg ">
            <SpotifyLogic
              voteRequestData={voteRequestData}
              clearVoteRequestData={() => setVoteRequestData(null)}
              musicQueue={musicQueue}
              setMusicQueue={setMusicQueue}
            />
          </div>
        </div>
        <div className="border border-blue-900 rounded-lg flex flex-col h-[37.8vw] w-[62vw]">
          <div className="flex-1 overflow-y-auto px-4 py-2"></div>
          {messages.map((msg, index) =>
            msg.sender === "system" ? (
              <div
                key={index}
                className="text-center text-sm text-gray-500 my-2"
              >
                {msg.text}
              </div>
            ) : msg.sender === username ? (
              <div key={index} className="m-2 flex flex-col items-end">
                <span className="text-xs text-gray-500 mb-1">You</span>
                <p className="border max-w-[30%] bg-white text-black break-words rounded-lg p-2 shadow">
                  {msg.text}
                </p>
              </div>
            ) : (
              <div key={index} className="m-2 flex flex-col items-start">
                <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                <p className="border max-w-[30%] bg-white text-black break-words rounded-lg p-2 shadow">
                  {msg.text}
                </p>
              </div>
            ),
          )}
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
