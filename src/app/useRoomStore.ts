import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Phase = "waiting" | "night" | "day" | "voting" | "ended";

export type RoomState = {
  roomCode: string;
  playerId: string;
  role: string | null;
  phase: Phase;
  alive: boolean;
  username: string;
  rehydrated: boolean;
  socket: import("socket.io-client").Socket | null;
  setSocket: (socket: import("socket.io-client").Socket) => void;
  setRoomCode: (roomCode: string) => void;
  setPlayerId: (playerId: string) => void;
  setRole: (role: string | null) => void;
  setPhase: (phase: Phase) => void;
  setAlive: (alive: boolean) => void;
  setUsername: (username: string) => void;
  setRehydrated: (done: boolean) => void;
};

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      roomCode: "",
      playerId: "",
      role: null,
      phase: "waiting",
      alive: true,
      username: "",
      rehydrated: false,
      socket: null,
      setSocket: (socket) => set({ socket }),
      setRoomCode: (roomCode: string) => set({ roomCode }),
      setPlayerId: (playerId: string) => set({ playerId }),
      setRole: (role: string | null) => set({ role }),
      setPhase: (phase: Phase) => set({ phase }),
      setAlive: (alive: boolean) => set({ alive }),
      setUsername: (username: string) => set({ username }),
      setRehydrated: (done) => set({ rehydrated: done }),
    }),
    {
      name: "room-store",
      partialize: (state) => ({
        roomCode: state.roomCode,
        playerId: state.playerId,
        role: state.role,
        phase: state.phase,
        alive: state.alive,
        username: state.username,
      }),
      onRehydrateStorage: () => (state) => {
        // This is called *after* state is loaded from storage
        state?.setRehydrated(true);
      },
    }
  )
);
