"use client";
import { Button } from "@repo/ui/button";
import { useSocket } from "../lib/WebSocketContext";
import { useRouter } from "next/navigation";
type LogoutModalprops = {
  onClose: () => void;
};

export function LogoutModal({ onClose }: LogoutModalprops) {
  const router = useRouter();
  const { sendSocketMessage } = useSocket();
  const handleLeaveroom = async () => {
    try {
      sendSocketMessage({
        event: "leaveRoom",
        payload: {},
      });
      localStorage.clear();
      router.push("/");
    } catch (error) {
      console.error("Error sending socket message:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 w-[90%] max-w-md">
        <p className="text-lg font-semibold text-center mb-6">
          Are you sure you want to leave this room?
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" size="md" onClick={handleLeaveroom}>
            Leave
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>{" "}
      </div>
    </div>
  );
}
