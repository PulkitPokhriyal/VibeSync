"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { CrossIcon } from "../icons/CrossIcon";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../lib/WebSocketContext";

type RoomModalprops = {
  type: "create" | "join";
  onClose: () => void;
};

export function RoomModal({ type, onClose }: RoomModalprops) {
  const options = ["Public", "Private", "Random"];
  const [selected, setSelected] = useState("Public");
  const username = useRef<HTMLInputElement>(null);
  const roomId = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { sendSocketMessage } = useSocket();

  const handleSubmit = async () => {
    if (type === "create" || selected === "Random") {
      try {
        const getRoomId = await sendSocketMessage({
          event: type,
          payload: {
            username: username.current?.value,
            roomType: selected.toLowerCase(),
          },
        });
        const name = username.current?.value;
        if (name) {
          localStorage.setItem("username", name);
        }
        router.push(`/room/${getRoomId.roomId}`);
      } catch (e) {
        console.error("Error try again", e);
      }
    } else {
      try {
        await sendSocketMessage({
          event: type,
          payload: {
            username: username.current?.value,
            roomId: roomId.current?.value,
            roomType: selected.toLowerCase(),
          },
        });
        const name = username.current?.value;
        if (name) {
          localStorage.setItem("username", name);
        }
        router.push(`/room/${roomId.current?.value}`);
      } catch (e) {
        console.error("Error try again", e);
      }
    }
  };

  return (
    <div className="flex flex-col bg-black/30 backdrop-blur-sm justify-center items-center fixed inset-0 z-50">
      <div
        className="flex flex-col items-center w-[350px] max-w-md p-8 rounded-2xl 
  bg-white/10 
  border border-white/20 
  text-white 
  shadow-lg 
  backdrop-filter
        backdrop-blur-md
   relative "
      >
        <button onClick={onClose} className="absolute top-3 right-3">
          <CrossIcon />
        </button>
        <h2 className="text-xl font-semibold mb-4 ">
          {type == "create" ? "Create Room" : "Join Room"}
        </h2>
        <div>
          <Input ref={username} placeholder="Enter Username" />
          {type == "join" &&
          (selected === "Public" || selected === "Private") ? (
            <Input ref={roomId} placeholder="Enter RoomId" required={true} />
          ) : (
            ""
          )}
        </div>

        <div className="flex gap-2">
          {(type == "create" ? options.slice(0, 2) : options).map((opt) => (
            <button
              type="button"
              key={opt}
              className={`px-4 py-2 rounded border ${
                selected === opt
                  ? "bg-[#5D3FD3] text-white"
                  : "bg-white text-gray-700 border-black"
              }`}
              onClick={() => setSelected(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="pt-4 pr-4">
          <Button variant="primary" size="md" onClick={handleSubmit}>
            Enter
          </Button>
        </div>
      </div>
    </div>
  );
}
