import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player } from '@/types/player'

export type Phase = 'night' | 'day' | 'voting' | 'ended'

export type NightStep =
  | 'werewolf'
  | 'seer'
  | 'witch'
  | 'bodyguard'
  | 'nightStart'
  | 'nightEnd'
  | 'dayStart'
  | 'voting'
  | 'votingResult'
  | 'gameEnded'

export interface NightPrompt {
  type: 'werewolf' | 'seer' | 'witch' | 'bodyguard' | 'hunter'
  message: string
  candidates?: Array<{
    id: string
    username: string
    isRedFlag?: boolean
  }>
  werewolves?: Array<{ id: string; username: string }>
  targetKilledByWerewolf?: string
  killedPlayerId?: string
  canHeal?: boolean
  canPoison?: boolean
  alivePlayerIds?: Array<{ id: string; username: string }>
  lastProtected?: string
}

export interface NightResult {
  diedPlayerIds: string[]
  deaths?: Array<{ playerId: string; cause: string }>
  cause: 'werewolf' | 'witch' | 'protected' | 'hunter'
}

export type RoomState = {
  roomCode: string
  playerId: string
  role: Player['role'] | null
  phase: Phase
  username: string
  avatarKey: number
  rehydrated: boolean
  approvedPlayers: Player[]
  socket: import('socket.io-client').Socket | null
  alive: boolean | null

  // Night phase states
  nightPrompt: NightPrompt | null
  nightResult: NightResult | null

  // Hunter death shooting state
  hunterDeathShooting: boolean

  setSocket: (socket: import('socket.io-client').Socket) => void
  setRoomCode: (roomCode: string) => void
  setPlayerId: (playerId: string) => void
  setRole: (role: Player['role'] | null) => void
  setPhase: (phase: Phase) => void
  setUsername: (username: string) => void
  setAvatarKey: (avatarKey: number) => void
  setRehydrated: (done: boolean) => void
  setApprovedPlayers: (players: Player[]) => void
  setResetGame: () => void
  setAlive: (alive: boolean) => void
  setNightPrompt: (prompt: NightPrompt | null) => void
  setNightResult: (result: NightResult | null) => void
  setHunterDeathShooting: (shooting: boolean) => void
  setStateRoomStore: (state: Partial<RoomState>) => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rehydrated: false,

      socket: null,
      roomCode: '',
      playerId: '',
      role: null,
      phase: 'night',
      username: '',
      avatarKey: 0,
      approvedPlayers: [],
      alive: null,
      // Night phase states
      nightPrompt: null,
      nightResult: null,
      hunterDeathShooting: false,

      setSocket: (socket) => set({ socket }),
      setRoomCode: (roomCode: string) => set({ roomCode }),
      setPlayerId: (playerId: string) => set({ playerId }),
      setRole: (role: Player['role'] | null) => set({ role }),
      setPhase: (phase: Phase) => set({ phase }),
      setUsername: (username: string) => set({ username }),
      setAvatarKey: (avatarKey: number) => set({ avatarKey }),
      setRehydrated: (done) => set({ rehydrated: done }),
      setApprovedPlayers: (players) =>
        set({
          approvedPlayers: players,
        }),
      setResetGame: () =>
        set({
          roomCode: '',
          playerId: '',
          role: null,
          phase: 'night',
          approvedPlayers: [],
          nightPrompt: null,
          nightResult: null,
          hunterDeathShooting: false,
        }),
      setAlive: (alive: boolean) => set({ alive }),
      // Night phase setters
      setNightPrompt: (prompt) => set({ nightPrompt: prompt }),
      setNightResult: (result) => set({ nightResult: result }),
      // Hunter death shooting setter
      setHunterDeathShooting: (shooting: boolean) =>
        set({ hunterDeathShooting: shooting }),
      setStateRoomStore: (state: Partial<RoomState>) =>
        set({
          ...get(),
          ...state,
        }),
    }),
    {
      name: 'room-store',
      partialize: (state) => ({
        roomCode: state.roomCode,
        playerId: state.playerId,
        role: state.role,
        phase: state.phase,
        username: state.username,
        avatarKey: state.avatarKey,
        approvedPlayers: state.approvedPlayers,
        alive: state.alive,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => {
            state.setRehydrated(true)
          }, 0)
        }
      },
    },
  ),
)
export const getStateRoomStore = () => {
  const {
    roomCode,
    playerId,
    role,
    phase,
    username,
    avatarKey,
    rehydrated,
    approvedPlayers,
    socket,
    nightPrompt,
    nightResult,
    alive,
    hunterDeathShooting,
  } = useRoomStore.getState()
  return {
    roomCode,
    playerId,
    role,
    phase,
    username,
    avatarKey,
    rehydrated,
    approvedPlayers,
    socket,
    nightPrompt,
    nightResult,
    alive,
    hunterDeathShooting,
  }
}
