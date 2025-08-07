import axios from "axios";

export async function getSpotifyAccessToken() {
  const response = await axios.post("/api/spotify?action=token");
  return response.data.access_token;
}

export async function searchTracks(query: string) {
  const response = await axios.get(
    `/api/spotify?action=search&q=${encodeURIComponent(query)}`,
  );
  return response.data;
}

export async function spotifyUserLogin() {
  const response = await axios.get("/api/spotify?action=login");
  const { authUrl, codeVerifier } = response.data;

  localStorage.setItem("code_verifier", codeVerifier);
  window.location.href = authUrl;
}

export async function exchangeCodeForToken(code: string) {
  const codeVerifier = localStorage.getItem("code_verifier");

  const response = await axios.post("/api/spotify?action=callback", {
    code,
    codeVerifier,
  });

  const data = response.data;
  console.log("Token response:", data);
  localStorage.setItem("access_token", data.access_token);
}

export async function checkIfUserHasPremium(accessToken: string) {
  const response = await axios.get("/api/spotify?action=user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { isPremium } = response.data;

  if (isPremium) {
    localStorage.setItem("premium", "true");
  } else {
    localStorage.setItem("premium", "false");
  }
}

export function SpotifyWebSDK() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const token = localStorage.getItem("access_token") || "<YOUR_ACCESS_TOKEN>";
    new Spotify.Player({
      name: "VibeSync Player",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.8,
    });
  };
}
