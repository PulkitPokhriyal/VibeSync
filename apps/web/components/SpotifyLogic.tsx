"use client";

import { Input } from "@repo/ui/input";
import { searchTracks } from "../lib/spotify";
import { useState } from "react";
import Image from "next/image";
import { useSocket } from "../lib/WebSocketContext.tsx";
import { SpotifyWebPlaySDK } from "./SpotifyWebPlay.tsx";
interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  album: {
    images: { url: string; height: number; width: number }[];
    name: string;
  };
  artists: { name: string }[];
}
export function SpotifyLogic({ musicQueue = [], currentTrack }) {
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const { sendSocketMessage } = useSocket();
  const [isDisable, setIsDisable] = useState(false);
  const handleSendMessage = async (track: SpotifyTrack) => {
    if (isDisable) return;
    setTimeout(() => {
      setIsDisable(false);
    }, 10000);
    try {
      setIsDisable(true);
      await sendSocketMessage({
        event: "vote-request",
        payload: {
          track: {
            id: track.id,
            name: track.name,
            duration_ms: track.duration_ms,
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
    <div className="max-h-[82.5dvh] flex flex-col">
      <p className="text-md font-semibold pt-4 pl-4 text-white">Music Queue</p>
      <Input
        onChange={handleChange}
        className="ml-3 mt-2"
        width="250px"
        placeholder="What do you want to play ?"
      />
      <SpotifyWebPlaySDK
        musicQueue={musicQueue}
        searchResults={results}
        nowPlaying={currentTrack}
      />
      <ul className="mx-3 mt-2 text-white">
        {results.map((track) => (
          <li
            key={track.id}
            className={`text-sm flex mb-3 gap-2 ${isDisable ? "hover:cursor-not-allowed" : "hover:cursor-pointer"}`}
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
      <ul className={results.length > 0 ? "hidden" : "mx-3 mt-2 text-white"}>
        <p
          className={
            musicQueue.length > 0 ? "text-lg font-semibold mb-2" : "hidden"
          }
        >
          Next In Music Queue
        </p>
        <div className="overflow-y-scroll">
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
        </div>
      </ul>
    </div>
  );
}
