"use client";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { useSocket } from "../lib/WebSocketContext";
import { useEffect, useState } from "react";
export function VotingModal({ voteRequestData, onClose }) {
  if (!voteRequestData) return null;
  const { sendSocketMessage } = useSocket();
  const { payload, requestedBy } = voteRequestData;
  const [isDisable, setIsDisable] = useState(false);
  const handleSendMessage = async () => {
    await sendSocketMessage({
      event: "up-vote",
      payload: "",
    });
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
      setIsDisable(false);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg p-6 w-[90%] max-w-md">
        <p className="text-center text-sm mb-2 text-gray-500">
          {`${requestedBy} wants to add:`}
        </p>
        <div className="flex justify-center gap-3">
          <div className="text-center mb-4">
            <Image
              src={payload.track?.album?.image}
              alt={payload.track?.name || "Track image"}
              width={60}
              height={60}
              className="rounded"
            />
          </div>
          <div>
            <p className="text-center text-white font-semibold">
              {payload.track.name}
            </p>
            <p className="text-center text-sm text-gray-400">
              {payload.track.artists}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="primary"
            size="md"
            disabled={isDisable}
            onClick={() => {
              setIsDisable(true);
              handleSendMessage();
            }}
          >
            <ThumbUpOffAltIcon />
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setIsDisable(true);
            }}
            disabled={isDisable}
          >
            <ThumbDownOffAltIcon />
          </Button>
        </div>
        <div className="absolute bottom-0 rounded-b-2xl left-0 w-full h-1 bg-gray-300 overflow-hidden rounded-b-md">
          <div className="h-full bg-blue-700 animate-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
