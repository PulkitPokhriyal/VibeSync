"use client";

import { Input } from "@repo/ui/input";
import { searchTracks } from "../lib/spotify";
import { useState } from "react";
import Image from "next/image";
import { sendSocketMessage } from "../lib/websocket";
import { VotingModal } from "./VotingModal";
interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    images: { url: string; height: number; width: number }[];
    name: string;
  };
  artists: { name: string }[];
}
export function SpotifyLogic({ voteRequestData, clearVoteRequestData }) {
  const [results, setResults] = useState<SpotifyTrack[]>([]);

  const handleSendMessage = async (track: SpotifyTrack) => {
    try {
      await sendSocketMessage({
        event: "vote-request",
        payload: {
          track,
        },
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleChange = async (e) => {
    const query = e.target.value;
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    try {
      const tracks = await searchTracks(query);
      setResults(tracks);
    } catch (error) {
      console.error("Error searching tracks:", error);
    }
  };

  return (
    <div>
      <p className="text-md font-semibold pt-4 pl-4">Music Queue</p>
      <Input
        onChange={handleChange}
        className="ml-3 mt-2"
        placeholder="What do you want to play ?"
      />
      <ul className="mx-3 mt-2">
        {results.map((track) => (
          <li
            key={track.id}
            className="text-sm flex mb-3 gap-2 hover:cursor-pointer"
            onClick={() => {
              handleSendMessage(track);
            }}
          >
            <Image
              src={track.album.images?.[0]?.url}
              alt={track.name}
              width={54}
              height={54}
            />
            <div>
              <p className="font-semibold">{track.name}</p>
              <p>{track.artists.map((a) => a.name).join(", ")}</p>
            </div>
          </li>
        ))}
      </ul>
      {voteRequestData && (
        <VotingModal
          voteRequestData={voteRequestData}
          onClose={clearVoteRequestData}
        />
      )}
    </div>
  );
}
