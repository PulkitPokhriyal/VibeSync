"use client";
import { Button } from "@repo/ui/button";
import Image from "next/image";

export function VotingModal({ voteRequestData, onClose }) {
  if (!voteRequestData) return null;

  const { payload, requestedBy } = voteRequestData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-[90%] max-w-md">
        <p className="text-center text-sm mb-2 text-gray-500">
          {`${requestedBy} wants to add:`}
        </p>
        <div className="flex justify-center gap-3">
          <div className="text-center mb-4">
            <Image
              src={payload.track?.album?.images?.[0]?.url}
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
              {payload.track.artists?.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="primary" size="md" onClick={onClose}>
            Yes
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            No
          </Button>
        </div>
      </div>
    </div>
  );
}
