import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Player } from '@/types/player'

const serverStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
}

export type Phase = 'night' | 'day' | 'voting' | 'conclude' | 'ended'

export interface NightPrompt {
  type: 'werewolf' | 'seer' | 'witch' | 'bodyguard' | 'hunter'
  message: string
  candidates?: Array<{
    id: string
    username: string
  }>
  werewolves?: Array<{ id: string; username: string }>
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

export type VotingChoice = 'target' | 'abstain'
export type VotingResponseKind = 'target' | 'abstain' | 'timeout'

export interface PlayerVotingState {
  hasResponded: boolean
  choice: VotingChoice | null
  targetId: string | null
  targetName: string | null
}

export interface VotingProgress {
  votedCount: number
  respondedCount?: number
  totalVoters: number
}

export interface VotingResultSummary {
  round: number
  eliminatedPlayerId: string | null
  eliminatedPlayerName: string | null
  cause: 'vote' | 'hunter' | 'tie' | 'no_votes'
  tiedPlayerIds?: string[]
  tiedPlayers?: Array<{ id: string; username: string }>
  votes: Array<{
    voterId: string
    voterName: string
    targetId: string | null
    targetName: string | null
    kind?: VotingResponseKind
  }>
  totals: Array<{ targetId: string; targetName: string; count: number }>
  abstainCount: number
  timeoutCount?: number
  targetVoteCount?: number
  votedCount: number
  respondedCount?: number
  totalVoters: number
}

export type RoomState = {
  roomCode: string
  playerId: string
  persistentPlayerId: string
  reconnectToken: string
  gmPersistentId: string
  gmReconnectToken: string
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

  // Voting phase state
  votingProgress: VotingProgress | null
  votingResult: VotingResultSummary | null
  playerVotingState: PlayerVotingState | null

  setSocket: (socket: import('socket.io-client').Socket) => void
  setRoomCode: (roomCode: string) => void
  setPlayerId: (playerId: string) => void
  setReconnectToken: (reconnectToken: string) => void
  setGmReconnectToken: (gmReconnectToken: string) => void
  setRole: (role: Player['role'] | null) => void
  setPhase: (phase: Phase) => void
  setUsername: (username: string) => void
  setAvatarKey: (avatarKey: number) => void
  setRehydrated: (done: boolean) => void
  setApprovedPlayers: (players: Player[]) => void
  setResetGame: () => void
  clearSavedSession: () => void
  clearGameRuntimeState: () => void
  clearPlayerRoomSession: () => void
  clearGmRoomSession: () => void
  setAlive: (alive: boolean | null) => void
  setNightPrompt: (prompt: NightPrompt | null) => void
  setNightResult: (result: NightResult | null) => void
  setHunterDeathShooting: (shooting: boolean) => void
  setVotingProgress: (progress: VotingProgress | null) => void
  setVotingResult: (result: VotingResultSummary | null) => void
  setPlayerVotingState: (state: PlayerVotingState | null) => void
  setStateRoomStore: (state: Partial<RoomState>) => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      rehydrated: false,

      socket: null,
      roomCode: '',
      playerId: '',
      persistentPlayerId: crypto.randomUUID(),
      reconnectToken: '',
      gmPersistentId: crypto.randomUUID(),
      gmReconnectToken: '',
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
      votingProgress: null,
      votingResult: null,
      playerVotingState: null,

      setSocket: (socket) => set({ socket }),
      setRoomCode: (roomCode: string) => set({ roomCode }),
      setPlayerId: (playerId: string) => set({ playerId }),
      setReconnectToken: (reconnectToken: string) => set({ reconnectToken }),
      setGmReconnectToken: (gmReconnectToken: string) =>
        set({ gmReconnectToken }),
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
          reconnectToken: '',
          gmReconnectToken: '',
          role: null,
          phase: 'night',
          approvedPlayers: [],
          alive: null,
          nightPrompt: null,
          nightResult: null,
          hunterDeathShooting: false,
          votingProgress: null,
          votingResult: null,
          playerVotingState: null,
        }),
      clearSavedSession: () =>
        set({
          roomCode: '',
          playerId: '',
          reconnectToken: '',
          gmReconnectToken: '',
          role: null,
          phase: 'night',
          approvedPlayers: [],
          alive: null,
          nightPrompt: null,
          nightResult: null,
          hunterDeathShooting: false,
          votingProgress: null,
          votingResult: null,
          playerVotingState: null,
        }),
      clearGameRuntimeState: () =>
        set({
          role: null,
          phase: 'night',
          approvedPlayers: [],
          alive: null,
          nightPrompt: null,
          nightResult: null,
          hunterDeathShooting: false,
          votingProgress: null,
          votingResult: null,
          playerVotingState: null,
        }),
      clearPlayerRoomSession: () =>
        set({
          roomCode: '',
          playerId: '',
          reconnectToken: '',
          role: null,
          phase: 'night',
          approvedPlayers: [],
          alive: null,
          nightPrompt: null,
          nightResult: null,
          hunterDeathShooting: false,
          votingProgress: null,
          votingResult: null,
          playerVotingState: null,
        }),
      clearGmRoomSession: () =>
        set({
          roomCode: '',
          gmReconnectToken: '',
          role: null,
          phase: 'night',
          approvedPlayers: [],
          alive: null,
          nightPrompt: null,
          nightResult: null,
          hunterDeathShooting: false,
          votingProgress: null,
          votingResult: null,
          playerVotingState: null,
        }),
      setAlive: (alive) => set({ alive }),
      // Night phase setters
      setNightPrompt: (prompt) => set({ nightPrompt: prompt }),
      setNightResult: (result) => set({ nightResult: result }),
      // Hunter death shooting setter
      setHunterDeathShooting: (shooting: boolean) =>
        set({ hunterDeathShooting: shooting }),
      setVotingProgress: (progress) => set({ votingProgress: progress }),
      setVotingResult: (result) => set({ votingResult: result }),
      setPlayerVotingState: (playerVotingState) => set({ playerVotingState }),
      setStateRoomStore: (state: Partial<RoomState>) => set(state),
    }),
    {
      name: 'room-store',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? serverStorage : localStorage,
      ),
      partialize: (state) => ({
        roomCode: state.roomCode,
        playerId: state.playerId,
        persistentPlayerId: state.persistentPlayerId,
        reconnectToken: state.reconnectToken,
        gmPersistentId: state.gmPersistentId,
        gmReconnectToken: state.gmReconnectToken,
        username: state.username,
        avatarKey: state.avatarKey,
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
    persistentPlayerId,
    reconnectToken,
    gmPersistentId,
    gmReconnectToken,
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
    votingProgress,
    votingResult,
    playerVotingState,
    clearSavedSession,
    clearGameRuntimeState,
    clearPlayerRoomSession,
    clearGmRoomSession,
  } = useRoomStore.getState()
  return {
    roomCode,
    playerId,
    persistentPlayerId,
    reconnectToken,
    gmPersistentId,
    gmReconnectToken,
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
    votingProgress,
    votingResult,
    playerVotingState,
    clearSavedSession,
    clearGameRuntimeState,
    clearPlayerRoomSession,
    clearGmRoomSession,
  }
}
