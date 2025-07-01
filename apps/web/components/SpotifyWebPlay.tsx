"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../lib/WebSocketContext";
import Script from "next/script";
import Image from "next/image";
import { SpotifyTrack } from "react-spotify-web-playback";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export function SpotifyWebPlaySDK({
  musicQueue,
  searchResults,
}: {
  musicQueue: string[];
  searchResults: SpotifyTrack[];
}) {
  const [deviceId, setDeviceId] = useState(null);
  const playerRef = useRef(null);
  const currentTrack = useRef(null);
  const isTrackPlaying = useRef(false);
  const musicQueueRef = useRef(musicQueue);
  const [trackPlaying, setTrackPlaying] = useState(null);
  const { socket } = useSocket();
  useEffect(() => {
    musicQueueRef.current = musicQueue;
  }, [musicQueue]);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const player = new window.Spotify.Player({
        name: "VibeSync Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.8,
      });

      player.addListener("ready", async ({ device_id }: any) => {
        await axios.put(
          "https://api.spotify.com/v1/me/player",
          {
            device_ids: [device_id],
            play: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        console.log("Spotify player ready with device ID", device_id);
        setDeviceId(device_id);
      });
      player.addListener("initialization_error", ({ message }: any) =>
        console.error("Spotify init error:", message),
      );
      playerRef.current = player;
      player.connect();
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const playTrack = async () => {
      if (!musicQueueRef.current.length || !deviceId || !player) return;
      if (isTrackPlaying.current) return;
      currentTrack.current = musicQueueRef.current[0].track.track;
      setTrackPlaying(currentTrack.current);
      try {
        await axios.put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            uris: [`spotify:track:${currentTrack.current.id}`],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("Track started playing");
        isTrackPlaying.current = true;
        socket?.send(
          JSON.stringify({
            event: "updateMusicQueue",
            payload: {
              musicQueue: musicQueueRef.current[0],
              roomId: localStorage.getItem("roomId"),
            },
          }),
        );

        setTimeout(async () => {
          const state = await player.getCurrentState();
          const { duration } = state;
          setTimeout(() => {
            isTrackPlaying.current = false;
            setTrackPlaying(null);
            playTrack();
          }, duration);
        }, 1000);
      } catch (err) {
        console.error("Error playing track:", err);
      }
    };

    playTrack();
  }, [musicQueue, deviceId]);

  return (
    <div>
      {trackPlaying ? (
        <div>
          <p
            className={
              searchResults.length > 0
                ? "hidden"
                : "text-white mx-3 text-lg font-semibold mb-2"
            }
          >
            Current Track
          </p>
          <div
            className={
              searchResults.length > 0
                ? "hidden"
                : "mx-3 text-sm flex mb-3 gap-2 text-white"
            }
          >
            <Image
              src={trackPlaying?.album?.image}
              alt={trackPlaying?.name}
              width={54}
              height={54}
            />
            <div>
              <p className="font-semibold">{trackPlaying?.name}</p>
              <p>{trackPlaying?.artists}</p>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Spotify SDK Loaded ");
          if (window.onSpotifyWebPlaybackSDKReady) {
            window.onSpotifyWebPlaybackSDKReady();
          }
        }}
      />{" "}
    </div>
  );
}
