import axios from "axios";

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
