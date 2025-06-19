"use client";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { useSocket } from "../lib/WebSocketContext";
export function VotingModal({ voteRequestData, onClose }) {
  if (!voteRequestData) return null;
  const { sendSocketMessage } = useSocket();
  const { payload, requestedBy } = voteRequestData;

  const handleSendMessage = async () => {
    await sendSocketMessage({
      event: "up-vote",
      payload: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-[90%] max-w-md">
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
            onClick={() => {
              handleSendMessage();
              onClose();
            }}
          >
            <ThumbUpOffAltIcon />
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            <ThumbDownOffAltIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
