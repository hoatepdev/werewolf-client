import type { CountdownState } from '@/hook/useCountdown'
import type { Phase, PlayerVotingState, VotingProgress } from '@/hook/useRoomStore'
import type { Player } from '@/types/player'
import type { Role } from '@/types/role'

export type GameHudMode = 'player' | 'gm-safe' | 'gm-private'

export type HudPhase = Phase | null

export type HudTimerContext =
  | 'cupid'
  | 'bodyguard'
  | 'werewolf'
  | 'witch'
  | 'seer'
  | 'voting'
  | string
  | null

export type TimerVisibility = 'player-self' | 'gm-safe' | 'gm-private'

export type PhaseTone = {
  labelClass: string
  borderClass: string
  glowClass: string
  dotClass: string
}

export type HudIdentity = {
  username?: string
  avatarKey?: number
  role?: Role | null
  alive?: boolean | null
  loverPartnerName?: string | null
}

export type HudStats = {
  totalPlayers: number
  alivePlayers: number
  deadPlayers: number
}

export type HudVoting = {
  respondedCount: number
  totalVoters: number
  hasResponded?: boolean
} | null

export type HudTimer = Pick<
  CountdownState,
  'secondsLeft' | 'totalSeconds' | 'progress' | 'isActive' | 'isExpired'
> & {
  timerContext: HudTimerContext
}

export type HudActions = {
  onLeave?: () => void
  onRefresh?: () => void
  onNextPhase?: () => void
  onOpenPrivate?: () => void
}

export type GameHudProps = {
  mode: GameHudMode
  roomCode: string
  phase: HudPhase
  isConnected?: boolean
  winner?: 'villagers' | 'werewolves' | 'tanner' | null
  identity?: HudIdentity
  stats?: HudStats
  voting?: HudVoting
  timer?: HudTimer | null
  timerVisibility?: TimerVisibility
  privateModeActive?: boolean
  actions?: HudActions
  compact?: boolean
  className?: string
}

export type VotingHudInput = {
  votingProgress: VotingProgress | null
  playerVotingState?: PlayerVotingState | null
  players: Player[]
}
