"use client";

import { useEffect } from "react";
import { exchangeCodeForToken } from "../../lib/spotify";
import { checkIfUserHasPremium } from "../../lib/spotify";
export default function Callback() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      exchangeCodeForToken(code).then(() => {
        const access_token = localStorage.getItem("access_token");
        if (!access_token) return;
        checkIfUserHasPremium(access_token).then(() => {
          window.location.href = "/";
        });
      });
    } else {
      window.location.href = "/";
      alert("Login with Spotify Account to create or join room");
    }
  }, []);
  return (
    <div>
      <h1>Redirecting....</h1>
    </div>
  );
}
