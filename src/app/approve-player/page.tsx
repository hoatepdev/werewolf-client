"use client";
import React, { useState, useEffect } from "react";
import { Check, CornerUpLeft, Loader2Icon, ScanQrCode, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { useRoomStore } from "../useRoomStore";
import { getSocket } from "@/lib/socket";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Player } from "@/types/player";
import { RoleSelection } from "@/components/RoleSelection";
import { Role } from "@/types/role";

const initialApproved: { id: number; name: string }[] = [];
const initialPending: { id: number; name: string }[] = [];

export default function ApprovePlayerPage() {
  const socket = getSocket();
  const router = useRouter();

  const [approvedPlayers, setApprovedPlayers] = useState(initialApproved);
  const [pendingPlayers, setPendingPlayers] = useState(initialPending);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const roomCode = useRoomStore((s) => s.roomCode);

  console.log("⭐ approvedPlayers", approvedPlayers);
  console.log("⭐ pendingPlayers", pendingPlayers);
  console.log("⭐ selectedRoles", selectedRoles);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    // Request the current list of pending/approved players
    socket.emit("gm:getPlayers", { roomCode });

    // Listen for updates from the server
    const handlePendingPlayers = (data: Player[]) => {
      console.log("⭐️ data", data);
      const approvedPlayers: Player[] = [];
      const pendingPlayers: Player[] = [];

      data.forEach((player: Player) => {
        if (player.status === "approved") {
          approvedPlayers.push(player);
        } else {
          pendingPlayers.push(player);
        }
      });
      setApprovedPlayers(approvedPlayers);
      setPendingPlayers(pendingPlayers);
    };

    const handleStartGameSuccess = () => {
      setLoading(false);
      toast.success("Game started successfully!");
      router.push(`/room/${roomCode}`);
    };

    const handleStartGameError = (error: { message: string }) => {
      setLoading(false);
      toast.error(error.message || "Failed to start game");
    };

    socket.on("room:getPlayers", handlePendingPlayers);
    socket.on("room:updatePlayers", handlePendingPlayers);
    socket.on("gm:startGameSuccess", handleStartGameSuccess);
    socket.on("gm:startGameError", handleStartGameError);

    return () => {
      socket.off("room:updatePlayers", handlePendingPlayers);
      socket.off("gm:startGameSuccess", handleStartGameSuccess);
      socket.off("gm:startGameError", handleStartGameError);
    };
  }, [roomCode, router]);

  const handleApprove = (player: { id: number; name: string }) => {
    setApprovedPlayers((prev) => [...prev, player]);
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id));
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("gm:approvePlayer", { roomCode, playerId: player.id });
    toast.success("Approved");
  };

  const handleReject = (player: { id: number; name: string }) => {
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id));
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("gm:rejectPlayer", { roomCode, playerId: player.id });
    toast.error("Rejected");
  };

  const handleRoleChange = (roles: Role[]) => {
    setSelectedRoles(roles);
  };

  const handleStartGame = () => {
    setLoading(true);
    socket.emit("gm:startGame", {
      roomCode,
      roles: selectedRoles,
      playerCount: approvedPlayers.length,
    });
  };

  // const countPlayer = approvedPlayers.length - 1;
  // const canContinue =
  //   approvedPlayers.length >= 5 &&
  //   approvedPlayers.length === selectedRoles.length;
  const countPlayer = 8;
  const canContinue = true;

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-6 justify-between">
        <button
          className="text-2xl mr-2 hover:text-gray-400 active:text-gray-500"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <CornerUpLeft className="w-6 h-6 text-gray-400" />
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="text-yellow-400 text-2xl hover:text-yellow-500"
              aria-label="Scan QR"
            >
              <ScanQrCode className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Game QR</DialogTitle>
              <DialogDescription>
                Scan this QR code to join the game
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl mb-4">
                {roomCode ? (
                  <QRCode
                    value={roomCode}
                    size={180}
                    bgColor="#fff"
                    fgColor="#000"
                    style={{ borderRadius: "0.75rem" }}
                  />
                ) : (
                  <span className="text-gray-400">No Room Code</span>
                )}
              </div>
              <DialogClose asChild>
                <button
                  className="mt-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  aria-label="Close QR dialog"
                >
                  Close
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col items-center w-full max-w-sm flex-1 justify-center mx-auto">
        <div className="w-full">
          <div className="text-base font-semibold mb-2 tracking-wide">
            APPROVED USER
          </div>
          <div className="space-y-2 mb-6">
            {approvedPlayers.length === 0 ? (
              <div className="bg-zinc-800 rounded-xl py-3 px-4 text-center text-zinc-400">
                No player
              </div>
            ) : (
              approvedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-zinc-800 rounded-xl py-3 px-4 flex items-center justify-between"
                >
                  <span className="font-medium text-base">{player.name}</span>
                </div>
              ))
            )}
          </div>
          <div className="text-base font-semibold mb-2 tracking-wide">
            PENDING USER
          </div>
          <div className="space-y-2 mb-6">
            {pendingPlayers.length === 0 ? (
              <div className="bg-zinc-800 rounded-xl py-3 px-4 text-center text-zinc-400">
                No player
              </div>
            ) : (
              pendingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-zinc-800 rounded-xl py-3 px-4 flex items-center justify-between"
                >
                  <span className="font-medium text-base">{player.name}</span>
                  <div className="flex gap-4">
                    <button
                      className=" border-2 border-green-500 hover:bg-green-600 hover:text-white text-green-500 rounded-full w-8 h-8 flex items-center justify-center text-lg focus:outline-none"
                      onClick={() => {
                        handleApprove(player);
                      }}
                      aria-label="Approve"
                    >
                      <Check className="w-6 h-6" />
                    </button>
                    <button
                      className=" border-2 border-red-500 hover:bg-red-600 hover:text-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg focus:outline-none active:bg-red-700"
                      onClick={() => {
                        handleReject(player);
                      }}
                      aria-label="Reject"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {countPlayer >= 0 && (
          <>
            <hr className="my-4 border-t border-zinc-700 w-full" />

            <RoleSelection
              onChange={handleRoleChange}
              totalCount={countPlayer}
            />
          </>
        )}
      </div>

      <div className="mt-auto max-w-sm">
        <div className="text-zinc-400 text-sm mb-2 text-center">
          Tapping CONTINUE will decline all pending users.
        </div>
        <button
          className={`w-full bg-yellow-400 text-black font-bold text-lg py-3 rounded-xl transition-colors duration-200 ${
            canContinue
              ? "active:bg-yellow-500"
              : "opacity-50 cursor-not-allowed"
          }`}
          disabled={!canContinue}
          onClick={handleStartGame}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" />
              <span>Game is starting</span>
            </div>
          ) : (
            <div>Continue</div>
          )}
        </button>
      </div>
    </main>
  );
}
