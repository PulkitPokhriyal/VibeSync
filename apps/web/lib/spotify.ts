import axios from "axios";

const REDIRECT_URI = "https://4b21674c1fe8.ngrok-free.app/callback";
export async function getSpotifyAccessToken() {
  const client_id = "a506f57865714751b1bb9c7fc44ad73e";
  const client_secret = "6031ee2368fb4d35aadf2fa7c7666d0c";
  if (!client_id || !client_secret) {
    throw new Error("Spotify credentials are missing");
  }
  const base64 = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64",
  );

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${base64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return response.data.access_token;
}

export async function searchTracks(query: string) {
  const token = await getSpotifyAccessToken();

  const response = await axios.get(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.data.tracks.items;
}

function generateCodeVerifier(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export async function spotifyUserLogin() {
  const SPOTIFY_CLIENT_ID = "a506f57865714751b1bb9c7fc44ad73e";
  const codeVerifier = generateCodeVerifier(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem("code_verifier", codeVerifier);
  const SCOPES = [
    "user-read-email",
    "user-read-private",
    "streaming",
    "user-modify-playback-state",
    "user-read-playback-state",
  ].join(" ");
  const args = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${args.toString()}`;
}
export async function exchangeCodeForToken(code: string) {
  const codeVerifier = localStorage.getItem("code_verifier");
  const body = new URLSearchParams({
    client_id: "a506f57865714751b1bb9c7fc44ad73e",
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier || "",
  });
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  const data = await response.data;
  console.log("Token response:", data);
  localStorage.setItem("access_token", data.access_token);
}
export async function checkIfUserHasPremium(accessToken: string) {
  const response = await axios.get("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const user = response.data;

  if (user.product === "premium") {
    localStorage.setItem("premium", "true");
  } else {
    localStorage.setItem("premium", "false");
  }
}

export function SpotifyWebSDK() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const token = "<YOUR_ACCESS_TOKEN>";

    const player = new Spotify.Player({
      name: "VibeSync Player",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.8,
    });
  };
}
