"use client";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { RoomModal } from "./modal";
import { spotifyUserLogin } from "../lib/spotify";

export const CreateRoom = () => {
  const [open, setOpen] = useState(false);
  const checkUserLogin = async () => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      setOpen(true);
    } else {
      await spotifyUserLogin();
    }
  };

  return (
    <div>
      <Button onClick={checkUserLogin} variant="primary" size="md">
        Create Room
      </Button>
      {open && <RoomModal type="create" onClose={() => setOpen(false)} />}
    </div>
  );
};
