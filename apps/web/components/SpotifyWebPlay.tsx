"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../lib/WebSocketContext";
import Script from "next/script";
import Image from "next/image";
import { TransformedTrack } from "../app/room/[roomId]/page.tsx";
import { SpotifyTrack } from "./SpotifyLogic.tsx";
import { QueueItem } from "../app/room/[roomId]/page.tsx";
import { NowPlayingData } from "../app/room/[roomId]/page.tsx";
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;

    Spotify: typeof Spotify;
  }
}
export function SpotifyWebPlaySDK({
  musicQueue,
  searchResults,
  nowPlaying,
}: {
  musicQueue: QueueItem[];
  searchResults: SpotifyTrack[];
  nowPlaying: NowPlayingData | null;
}) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const currentTrack = useRef<TransformedTrack | null>(null);
  const isTrackPlaying = useRef(false);
  const musicQueueRef = useRef<QueueItem[]>(musicQueue || []);
  const [trackPlaying, setTrackPlaying] = useState<TransformedTrack | null>(
    null,
  );
  const { socket } = useSocket();
  const nowPlayingRef = useRef<NowPlayingData | null>(null);
  const token = localStorage.getItem("access_token");
  const player = playerRef.current;
  const playTrack = async () => {
    if (
      !musicQueueRef.current?.length ||
      nowPlayingRef.current ||
      !deviceId ||
      !player
    )
      return;
    if (isTrackPlaying.current) return;
    currentTrack.current = musicQueueRef.current[0]?.track ?? null;
    setTrackPlaying(currentTrack.current);
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          uris: [`spotify:track:${currentTrack.current?.id}`],
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
        if (!state) return;
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
    const syncPlaybackForNewUser = async () => {
      if (!nowPlaying || !deviceId || !player) return;
      nowPlayingRef.current = nowPlaying;
      console.log(nowPlayingRef.current);
      if (isTrackPlaying.current) return;

      const trackData = nowPlayingRef.current?.currentTrack?.track ?? null;
      const trackId = trackData?.id;
      console.log("Track ID:", nowPlayingRef.current?.currentTrack?.track?.id);
      setTrackPlaying(trackData);
      const startedAt = nowPlayingRef.current?.startedAt;
      const now = Date.now();
      if (!startedAt) return;
      const position = now - startedAt;

      try {
        await axios.put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            uris: [`spotify:track:${trackId}`],
            position_ms: position,
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
        nowPlayingRef.current = null;
        setTimeout(async () => {
          const state = await player.getCurrentState();
          if (!state) return;
          const { duration } = state;
          const remaining = duration - position;
          setTimeout(() => {
            isTrackPlaying.current = false;
            setTrackPlaying(null);
            playTrack();
          }, remaining);
        }, 1000);
      } catch (err) {
        console.error("Error playing track:", err);
      }
    };
    syncPlaybackForNewUser();
  }, [nowPlaying, deviceId, player]);

  useEffect(() => {
    if (!token) return;

    playTrack();
  }, [musicQueue, deviceId]);
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }

      if (deviceId && token) {
        axios
          .put(
            "https://api.spotify.com/v1/me/player/pause",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          .catch((err) => console.error("Error pausing on leave:", err));
      }

      isTrackPlaying.current = false;
    };
  }, []);
  return (
    <div>
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
