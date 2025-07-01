"use client";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "@/hook/useRoomStore";
import { PlayerGrid } from "@/components/PlayerGrid";
import { MockDataPanel } from "@/components/MockDataPanel";
import { Player } from "@/types/player";
import { CornerUpLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { AVATAR_OPTIONS } from "@/lib/mockAvatar";
import { confirmDialog } from "@/components/ui/alert-dialog";
import RoleRandomizerModal from "@/components/RoleRandomizerModal";
import { LIST_ROLE } from "@/constants/role";

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const router = useRouter();
  const isGM = useRoomStore((s) => s.isGm);
  const [showMockPanel, setShowMockPanel] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [assignedRole, setAssignedRole] = useState(LIST_ROLE[0]);

  const { roomCode } = React.use(params);

  const playerId = useRoomStore((s) => s.playerId);
  const approvedPlayers = useRoomStore((s) => s.approvedPlayers);
  const setApprovedPlayers = useRoomStore((s) => s.setApprovedPlayers);
  const username = useRoomStore((s) => s.username);
  const avatarKey = useRoomStore((s) => s.avatarKey);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    // socket.emit("room:join", { roomCode, playerId, isGM });

    socket.emit("rq_player:getPlayers", { roomCode });

    socket.on("room:getPlayers", (data: Player[]) => {
      console.log("⭐ room:getPlayers", data);
      const approvedPlayers = data.filter(
        (player) => player.status === "approved",
      );
      setApprovedPlayers(approvedPlayers);
    });
    socket.on("room:updatePlayers", (data: Player[]) => {
      console.log("⭐ room:updatePlayers", data);
      const approvedPlayers = data.filter(
        (player) => player.status === "approved",
      );
      setApprovedPlayers(approvedPlayers);
    });

    return () => {
      socket.off("room:getPlayers");
      socket.off("room:updatePlayers");
    };
  }, [roomCode, playerId, isGM, setApprovedPlayers]);

  // Demo: Show modal after 2s (remove in production)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssignedRole(LIST_ROLE[Math.floor(Math.random() * LIST_ROLE.length)]);
      setShowRoleModal(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMockDataPanel = () => setShowMockPanel(!showMockPanel);

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: "Leave Room",
      description: "Are you sure you want to leave the room?",
      confirmText: "Leave",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    // const socket = getSocket();
    // socket.emit("room:leave", { roomCode });
    router.push("/join-room");
  };

  const handleContinueRole = () => setShowRoleModal(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
            aria-label="Back"
            onClick={handleLeaveRoom}
          >
            <CornerUpLeft className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          {isGM ? (
            <button
              className="text-zinc-400 transition-colors hover:text-yellow-400"
              onClick={toggleMockDataPanel}
              title="Toggle Mock Data Panel"
            >
              <Settings className="h-5 w-5" />
            </button>
          ) : username ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[80px] truncate text-sm font-semibold text-yellow-300">
                {username}
              </span>
              <span className="text-2xl">{AVATAR_OPTIONS[avatarKey]}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <div className="text-center mb-4 ">
          <h1 className="text-xl font-bold">
            Lobby Code: <span className="text-yellow-400">{roomCode}</span>
          </h1>
        </div>
        <div className="mb-6 w-full max-w-sm">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold">
              Players ({approvedPlayers.length}/9)
            </h2>
          </div>
          <PlayerGrid players={approvedPlayers} currentPlayerId={playerId} />
        </div>
      </div>
      <MockDataPanel
        isVisible={showMockPanel}
        toggleMockDataPanel={toggleMockDataPanel}
      />
      <RoleRandomizerModal
        assignedRole={assignedRole}
        onContinue={handleContinueRole}
        open={showRoleModal}
      />
    </main>
  );
};

export default RoomPage;
