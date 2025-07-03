import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player } from '@/types/player'

export type Phase = 'night' | 'day' | 'voting' | 'ended'

export type RoomState = {
  roomCode: string
  playerId: string
  role: string | null
  phase: Phase
  alive: boolean
  username: string
  avatarKey: number
  rehydrated: boolean
  approvedPlayers: Player[]
  isGm: boolean
  socket: import('socket.io-client').Socket | null
  setSocket: (socket: import('socket.io-client').Socket) => void
  setRoomCode: (roomCode: string) => void
  setPlayerId: (playerId: string) => void
  setRole: (role: string | null) => void
  setPhase: (phase: Phase) => void
  setAlive: (alive: boolean) => void
  setUsername: (username: string) => void
  setAvatarKey: (avatarKey: number) => void
  setRehydrated: (done: boolean) => void
  setApprovedPlayers: (players: Player[]) => void
  setIsGm: (isGm: boolean) => void
  setResetGame: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      roomCode: '',
      playerId: '',
      role: null,
      phase: 'night',
      alive: true,
      username: '',
      avatarKey: 0,
      rehydrated: false,
      approvedPlayers: [],
      socket: null,
      isGm: false,
      setSocket: (socket) => set({ socket }),
      setRoomCode: (roomCode: string) => set({ roomCode }),
      setPlayerId: (playerId: string) => set({ playerId }),
      setRole: (role: string | null) => set({ role }),
      setPhase: (phase: Phase) => set({ phase }),
      setAlive: (alive: boolean) => set({ alive }),
      setUsername: (username: string) => set({ username }),
      setAvatarKey: (avatarKey: number) => set({ avatarKey }),
      setRehydrated: (done) => set({ rehydrated: done }),
      setApprovedPlayers: (players) => set({ approvedPlayers: players }),
      setIsGm: (isGm: boolean) => set({ isGm }),
      setResetGame: () =>
        set({
          roomCode: '',
          playerId: '',
          role: null,
          phase: 'night',
          alive: true,
          approvedPlayers: [],
          isGm: false,
        }),
    }),
    {
      name: 'room-store',
      partialize: (state) => ({
        roomCode: state.roomCode,
        playerId: state.playerId,
        role: state.role,
        phase: state.phase,
        alive: state.alive,
        username: state.username,
        avatarKey: state.avatarKey,
        isGm: state.isGm,
      }),
      onRehydrateStorage: () => (state) => {
        // This is called *after* state is loaded from storage
        state?.setRehydrated(true)
      },
    },
  ),
)
