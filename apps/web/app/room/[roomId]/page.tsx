"use-client";

import React from "react";

export default function RoomPage({ params }) {
  const { roomId } = params;

  return (
    <div>
      <h1>Welcome to Room: {roomId}</h1>
    </div>
  );
}
