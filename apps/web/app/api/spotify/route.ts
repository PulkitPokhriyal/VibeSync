import { NextRequest, NextResponse } from "next/server";

const REDIRECT_URI = "https://1e13ea3fb017.ngrok-free.app/callback";

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
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getSpotifyToken() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error("Spotify credentials are missing");
  }

  const base64 = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64",
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${base64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "search": {
        const query = searchParams.get("q");
        if (!query) {
          return NextResponse.json(
            { error: "Query parameter is required" },
            { status: 400 },
          );
        }

        const token = await getSpotifyToken();
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();
        return NextResponse.json(data.tracks.items);
      }

      case "login": {
        const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
        const codeVerifier = generateCodeVerifier(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

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

        const authUrl = `https://accounts.spotify.com/authorize?${args.toString()}`;

        return NextResponse.json({
          authUrl,
          codeVerifier,
        });
      }

      case "user": {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return NextResponse.json(
            { error: "Authorization header required" },
            { status: 401 },
          );
        }

        const accessToken = authHeader.split(" ")[1];

        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const user = await response.json();
        const isPremium = user.product === "premium";

        return NextResponse.json({
          user,
          isPremium,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "token": {
        const token = await getSpotifyToken();
        return NextResponse.json({ access_token: token });
      }

      case "callback": {
        const { code, codeVerifier } = await request.json();

        if (!code || !codeVerifier) {
          return NextResponse.json(
            { error: "Code and code verifier are required" },
            { status: 400 },
          );
        }

        const body = new URLSearchParams({
          client_id: process.env.SPOTIFY_CLIENT_ID || "",
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        });

        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        const data = await response.json();

        return NextResponse.json({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
