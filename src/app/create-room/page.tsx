"use client";

import React, { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "../useRoomStore";
import QRCode from "react-qr-code";
import { Clipboard, CornerUpLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CreateRoomPage = () => {
  const socket = getSocket();
  const router = useRouter();

  const roomCode = useRoomStore((s) => s.roomCode);
  const setRoomCode = useRoomStore((s) => s.setRoomCode);
  const username = useRoomStore((s) => s.username);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("gm:createRoom", { name: username });

    socket.on("room:createRoom", (data: { roomCode: string }) => {
      setRoomCode(data.roomCode);
      console.log("room:createRoom", data.roomCode);
    });

    return () => {
      socket.off("room:createRoom");
    };
  }, [setRoomCode]);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen px-4 bg-zinc-900 py-6 max-w-3xl mx-auto">
      {/* Top bar with back arrow */}
      <div className="w-full flex items-center mb-4">
        <button
          className="text-white text-2xl mr-2 hover:text-gray-400"
          aria-label="Back"
          onClick={() => router.back()}
        >
          {/* Back arrow icon placeholder */}
          <CornerUpLeft className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center w-full max-w-sm flex-1 justify-center">
        <h1 className="text-3xl font-extrabold text-white mb-2 text-center">
          Join game
        </h1>
        <p className="text-gray-400 text-center mb-6 text-base">
          Game players need to scan this QR code using their devices to request
          to join the game
        </p>
        {/* QR code placeholder with yellow border */}
        <div className="rounded-2xl border-4 border-yellow-400 bg-white p-2 mb-20">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-xl">
            {roomCode ? (
              <QRCode
                value={roomCode}
                // size={180}
                bgColor="#fff"
                fgColor="#000"
                className="rounded-xl"
              />
            ) : (
              <span className="text-gray-400">Generating QR Code...</span>
            )}
          </div>
        </div>
        {/* Divider with REQUEST MANUALLY */}
        <div className="flex items-center w-full mb-2">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="mx-3 text-gray-400 text-sm font-semibold tracking-widest">
            REQUEST MANUALLY
          </span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>
        <p className="text-gray-400 text-center mb-4 text-sm">
          Players can also copy and paste the following game id to the game
          joining request box in their app
        </p>
        {/* Game code with copy button */}
        <div className="flex items-center w-full bg-[#23232a] border-2 border-yellow-400 rounded-xl px-4 py-3 mb-8">
          <span className="text-white font-mono text-lg truncate flex-1">
            {roomCode}
          </span>
          <button
            className="ml-2 text-yellow-400 text-xl hover:text-yellow-500"
            aria-label="Copy room code"
          >
            {/* Copy icon placeholder */}
            <Clipboard
              className="w-6 h-6"
              onClick={() => {
                navigator.clipboard.writeText(roomCode || "");
                toast.success("Copied to clipboard");
              }}
            />
          </button>
        </div>
      </div>
      {/* Continue button */}
      <button
        className="w-full max-w-sm bg-yellow-400 text-black font-bold text-lg py-3 rounded-xl mb-2 active:bg-yellow-500 transition-colors duration-200"
        onClick={() => router.push("/approve-player")}
      >
        Continue
      </button>
    </main>
  );
};

export default CreateRoomPage;
