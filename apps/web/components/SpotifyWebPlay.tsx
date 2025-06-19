import axios from "axios";
import { useEffect } from "react";
import Script from "next/script";
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export function SpotifyWebPlaySDK() {
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
        console.log("Spotify player ready with device ID", device_id);

        try {
          await axios.put(
            "https://api.spotify.com/v1/me/player",
            {
              device_ids: [device_id],
              play: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log("Playback transferred to this device");
        } catch (err) {
          console.error(" Error transferring playback", err);
        }
        try {
          const response = await axios.put(
            `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
            {
              uris: [`spotify:track:${trackId}`],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          console.log("Track started playing", response.status);
        } catch (error) {
          console.error("Error playing track:", error);
        }
      });
      player.addListener("initialization_error", ({ message }: any) => {
        console.error("Spotify init error:", message);
      });

      player.connect();
    };
  }, []);

  return (
    <div>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
