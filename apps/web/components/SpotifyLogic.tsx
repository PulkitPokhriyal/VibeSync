"use client";

import { Input } from "@repo/ui/input";
import { searchTracks } from "../lib/spotify";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSocket } from "../lib/WebSocketContext.tsx";
import { VotingModal } from "./VotingModal";
import { SpotifyWebPlaySDK } from "./SpotifyWebPlay.tsx";
interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    images: { url: string; height: number; width: number }[];
    name: string;
  };
  artists: { name: string }[];
}
export function SpotifyLogic({
  voteRequestData,
  clearVoteRequestData,
  musicQueue = [],
  setMusicQueue,
}) {
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const { sendSocketMessage } = useSocket();
  const handleSendMessage = async (track: SpotifyTrack) => {
    try {
      await sendSocketMessage({
        event: "vote-request",
        payload: {
          track: {
            id: track.id,
            name: track.name,
            artists: track.artists.map((a) => a.name).join(","),
            album: {
              name: track.album.name,
              image: track.album.images?.[0]?.url,
            },
          },
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
      <SpotifyWebPlaySDK
        musicQueue={musicQueue}
        setMusicQueue={setMusicQueue}
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
      <ul className="mx-3 mt-2">
        {musicQueue.map((track, index) => (
          <li key={index} className="text-sm flex mb-3 gap-2">
            <Image
              src={track.track.track?.album?.image}
              alt={track.track.track.name}
              width={54}
              height={54}
            />
            <div>
              <p className="font-semibold">{track.track.track.name}</p>
              <p>{track.track.track.artists}</p>
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
