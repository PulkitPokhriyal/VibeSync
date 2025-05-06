"use client";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { RoomModal } from "./modal";

export const CreateRoom = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="primary" size="md">
        Create Room
      </Button>
      {open && <RoomModal type="create" onClose={() => setOpen(false)} />}
    </div>
  );
};
