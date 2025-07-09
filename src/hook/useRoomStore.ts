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
  cause: 'werewolf' | 'witch' | 'protected' | 'hunter'
}

export interface SeerResult {
  targetId: string
  targetName: string
  isWerewolf: boolean
}

export interface WerewolfVoteResult {
  targetId: string
  votes: Record<string, string>
}

export interface GmUpdate {
  step: NightStep
  message: string
  data?:
    | Record<string, unknown>
    | {
        step: string
        action: string
        playerId?: string
        playerName?: string
        targetId?: string
        targetName?: string
        message: string
        timestamp: number
        isWerewolf?: boolean
        votes?: Record<string, string>
        heal?: boolean
        healTargetId?: string
        healTargetName?: string
        poisonTargetId?: string
        poisonTargetName?: string
        werewolves?: Array<{ id: string; username: string }>
        seers?: Array<{ id: string; username: string }>
        witches?: Array<{ id: string; username: string }>
        bodyguards?: Array<{ id: string; username: string }>
        werewolfTarget?: string
        canHeal?: boolean
        canPoison?: boolean
        lastProtected?: string
      }
  timestamp: number
}

export type RoomState = {
  roomCode: string
  playerId: string
  role: Player['role'] | null
  phase: Phase
  alive: boolean
  username: string
  avatarKey: number
  rehydrated: boolean
  approvedPlayers: Player[]
  isGm: boolean
  socket: import('socket.io-client').Socket | null
  turn: string

  // Night phase states
  nightPrompt: NightPrompt | null
  nightResult: NightResult | null
  werewolfVotes: Record<string, string>
  seerResult: SeerResult | null
  witchAction: {
    heal?: boolean
    poisonTargetId?: string
  }
  bodyguardTarget: string | null

  // GM monitoring
  gmUpdates: GmUpdate[]

  setSocket: (socket: import('socket.io-client').Socket) => void
  setRoomCode: (roomCode: string) => void
  setPlayerId: (playerId: string) => void
  setRole: (role: Player['role'] | null) => void
  setPhase: (phase: Phase) => void
  setAlive: (alive: boolean) => void
  setUsername: (username: string) => void
  setAvatarKey: (avatarKey: number) => void
  setRehydrated: (done: boolean) => void
  setApprovedPlayers: (players: Player[]) => void
  setIsGm: (isGm: boolean) => void
  setResetGame: () => void

  // Night phase setters
  setNightPrompt: (prompt: NightPrompt | null) => void
  setNightResult: (result: NightResult | null) => void
  setWerewolfVotes: (votes: Record<string, string>) => void
  setSeerResult: (result: SeerResult | null) => void
  setWitchAction: (action: { heal?: boolean; poisonTargetId?: string }) => void
  setBodyguardTarget: (target: string | null) => void
  addGmUpdate: (update: {
    step: NightStep
    message: string
    data?: Record<string, unknown>
  }) => void
  clearGmUpdates: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
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
      turn: '',

      // Night phase states
      nightPrompt: null,
      nightResult: null,
      werewolfVotes: {},
      seerResult: null,
      witchAction: {},
      bodyguardTarget: null,

      // GM monitoring
      gmUpdates: [],

      setSocket: (socket) => set({ socket }),
      setRoomCode: (roomCode: string) => set({ roomCode }),
      setPlayerId: (playerId: string) => set({ playerId }),
      setRole: (role: Player['role'] | null) => set({ role }),
      setPhase: (phase: Phase) => set({ phase }),
      setAlive: (alive: boolean) => set({ alive }),
      setUsername: (username: string) => set({ username }),
      setAvatarKey: (avatarKey: number) => set({ avatarKey }),
      setRehydrated: (done) => set({ rehydrated: done }),
      setApprovedPlayers: (players) =>
        set({
          approvedPlayers: players,
        }),
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
          nightPrompt: null,
          nightResult: null,
          werewolfVotes: {},
          seerResult: null,
          witchAction: {},
          bodyguardTarget: null,
          gmUpdates: [],
        }),

      // Night phase setters
      setNightPrompt: (prompt) => set({ nightPrompt: prompt }),
      setNightResult: (result) => set({ nightResult: result }),
      setWerewolfVotes: (votes) => set({ werewolfVotes: votes }),
      setSeerResult: (result) => set({ seerResult: result }),
      setWitchAction: (action) => set({ witchAction: action }),
      setBodyguardTarget: (target) => set({ bodyguardTarget: target }),
      addGmUpdate: (update) =>
        set((state) => ({
          gmUpdates: [...state.gmUpdates, { ...update, timestamp: Date.now() }],
        })),
      clearGmUpdates: () => set({ gmUpdates: [] }),
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
        approvedPlayers: state.approvedPlayers,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setRehydrated(true)
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
    alive,
    username,
    avatarKey,
    rehydrated,
    approvedPlayers,
    isGm,
    socket,
    turn,
    nightPrompt,
    nightResult,
    werewolfVotes,
    seerResult,
    witchAction,
    bodyguardTarget,
    gmUpdates,
  } = useRoomStore.getState()
  return {
    roomCode,
    playerId,
    role,
    phase,
    alive,
    username,
    avatarKey,
    rehydrated,
    approvedPlayers,
    isGm,
    socket,
    turn,
    nightPrompt,
    nightResult,
    werewolfVotes,
    seerResult,
    witchAction,
    bodyguardTarget,
    gmUpdates,
  }
}
