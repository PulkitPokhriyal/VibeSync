"use client";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { RoomModal } from "./modal";

export const JoinRoom = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="primary" size="md">
        Join Room
      </Button>
      {open && <RoomModal type="join" onClose={() => setOpen(false)} />}
    </div>
  );
};
