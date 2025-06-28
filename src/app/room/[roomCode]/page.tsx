"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "../../useRoomStore";

const RoomPage = ({ params }: { params: { roomCode: string } }) => {
  const searchParams = useSearchParams();
  const isGM = searchParams.get("gm") === "true";
  const phase = useRoomStore((s) => s.phase);
  const setPhase = useRoomStore((s) => s.setPhase);
  const role = useRoomStore((s) => s.role);
  const setRole = useRoomStore((s) => s.setRole);
  const alive = useRoomStore((s) => s.alive);
  const setAlive = useRoomStore((s) => s.setAlive);
  const playerId = useRoomStore((s) => s.playerId);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("room:join", { roomCode: params.roomCode, playerId, isGM });

    socket.on("room:phase", (newPhase: string) => {
      setPhase(newPhase as import("../../useRoomStore").Phase);
    });
    socket.on("room:role", (newRole: string) => {
      setRole(newRole);
    });
    socket.on("room:alive", (isAlive: boolean) => {
      setAlive(isAlive);
    });

    return () => {
      socket.off("room:phase");
      socket.off("room:role");
      socket.off("room:alive");
    };
  }, [params.roomCode, playerId, isGM, setPhase, setRole, setAlive]);

  const handleNextPhase = () => {
    const socket = getSocket();
    socket.emit("gm:nextPhase", { roomCode: params.roomCode });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-2xl font-bold mb-4">Room: {params.roomCode}</h1>
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm flex flex-col items-center">
        <div className="mb-4">
          <span className="text-gray-500">Phase</span>
          <div className="text-xl font-semibold mt-1">{phase}</div>
        </div>
        {isGM ? (
          <div className="w-full flex flex-col items-center">
            <div className="mb-2 text-blue-600 font-bold">Game Master View</div>
            <button
              className="w-full bg-black text-white font-semibold py-2 rounded-xl mt-4"
              onClick={handleNextPhase}
            >
              Next Phase
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="mb-2 text-green-600 font-bold">Player View</div>
            <div className="mb-2">
              Role: <span className="font-semibold">{role || "?"}</span>
            </div>
            <div>
              Status:{" "}
              <span className={alive ? "text-green-600" : "text-red-500"}>
                {alive ? "Alive" : "Dead"}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default RoomPage;
