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
  nowPlaying,
}: {
  musicQueue: string[];
  searchResults: SpotifyTrack[];
  nowPlaying: any;
}) {
  const [deviceId, setDeviceId] = useState(null);
  const playerRef = useRef(null);
  const currentTrack = useRef(null);
  const isTrackPlaying = useRef(false);
  const musicQueueRef = useRef(musicQueue);
  const [trackPlaying, setTrackPlaying] = useState(null);
  const { socket } = useSocket();
  const nowPlayingRef = useRef(null);
  const token = localStorage.getItem("access_token");
  const player = playerRef.current;
  const playTrack = async () => {
    if (
      !musicQueueRef.current.length ||
      nowPlayingRef.current ||
      !deviceId ||
      !player
    )
      return;
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
      nowPlayingRef.current =
        typeof nowPlaying === "string" ? JSON.parse(nowPlaying) : nowPlaying;
      console.log(nowPlayingRef.current);
      if (isTrackPlaying.current) return;

      const trackData = nowPlayingRef.current.currentTrack.track?.track;
      const trackId = trackData?.id;
      console.log(
        "Track ID:",
        nowPlayingRef.current?.currentTrack?.track?.track?.id,
      );
      setTrackPlaying(trackData);
      const startedAt = nowPlayingRef.current.startedAt;
      const now = Date.now();
      const position = now - startedAt;
      console.log("Now:", now);
      console.log("StartedAt:", startedAt);
      console.log("Position:", position);
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
  }, [nowPlaying, deviceId]);

  useEffect(() => {
    if (!token) return;

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
