import { LIST_ROLE } from '@/constants/role'
import type { Phase, PlayerVotingState, VotingProgress } from '@/hook/useRoomStore'
import type { Player } from '@/types/player'
import type { Role } from '@/types/role'
import type { GameHudMode, HudPhase, HudTimerContext, PhaseTone, TimerVisibility } from './GameHud.types'

const PHASE_LABELS: Record<Phase, string> = {
  night: 'Đêm',
  day: 'Ngày',
  voting: 'Bỏ phiếu',
  conclude: 'Kết quả biểu quyết',
  ended: 'Kết thúc',
}

const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  night: 'Các vai trò thực hiện hành động ban đêm.',
  day: 'Cả làng thảo luận và quan sát kết quả.',
  voting: 'Người chơi còn sống chọn người bị loại.',
  conclude: 'Công bố kết quả biểu quyết.',
  ended: 'Ván chơi đã kết thúc.',
}

const PHASE_TONES: Record<Phase | 'idle', PhaseTone> = {
  night: {
    labelClass: 'bg-blue-500/15 text-blue-200 ring-blue-400/30',
    borderClass: 'border-blue-400/30',
    glowClass: 'shadow-blue-950/40',
    dotClass: 'bg-blue-400',
  },
  day: {
    labelClass: 'bg-yellow-400/15 text-yellow-200 ring-yellow-300/40',
    borderClass: 'border-yellow-300/30',
    glowClass: 'shadow-yellow-950/30',
    dotClass: 'bg-yellow-300',
  },
  voting: {
    labelClass: 'bg-red-500/15 text-red-200 ring-red-400/30',
    borderClass: 'border-red-400/30',
    glowClass: 'shadow-red-950/40',
    dotClass: 'bg-red-400',
  },
  conclude: {
    labelClass: 'bg-purple-500/15 text-purple-200 ring-purple-400/30',
    borderClass: 'border-purple-400/30',
    glowClass: 'shadow-purple-950/40',
    dotClass: 'bg-purple-400',
  },
  ended: {
    labelClass: 'bg-zinc-500/15 text-zinc-200 ring-zinc-400/30',
    borderClass: 'border-zinc-500/40',
    glowClass: 'shadow-zinc-950/40',
    dotClass: 'bg-zinc-300',
  },
  idle: {
    labelClass: 'bg-zinc-700/60 text-zinc-200 ring-zinc-500/30',
    borderClass: 'border-zinc-700',
    glowClass: 'shadow-zinc-950/40',
    dotClass: 'bg-zinc-400',
  },
}

const TIMER_LABELS: Record<string, string> = {
  cupid: 'Lượt Thần tình yêu',
  bodyguard: 'Lượt Bảo vệ',
  werewolf: 'Lượt Sói',
  witch: 'Lượt Phù thủy',
  seer: 'Lượt Tiên tri',
  voting: 'Thời gian bỏ phiếu',
}

const WINNER_LABELS = {
  villagers: { name: 'Dân làng', emoji: '👨‍🌾' },
  werewolves: { name: 'Sói', emoji: '🐺' },
  tanner: { name: 'Chán đời', emoji: '😵' },
} as const

export function getPhaseLabel(phase: HudPhase) {
  return phase ? PHASE_LABELS[phase] : 'Chưa bắt đầu'
}

export function getPhaseTone(phase: HudPhase) {
  return phase ? PHASE_TONES[phase] : PHASE_TONES.idle
}

export function getPhaseDescription(phase: HudPhase, mode: GameHudMode) {
  if (!phase) return 'Đang chờ quản trò bắt đầu ván.'
  if (mode === 'gm-safe' && phase === 'night') return 'Đang điều phối lượt đêm.'
  return PHASE_DESCRIPTIONS[phase]
}

export function getTimerContextLabel(
  timerContext: HudTimerContext,
  visibility: TimerVisibility,
) {
  if (!timerContext) return null
  if (timerContext === 'voting') return TIMER_LABELS.voting
  if (visibility === 'gm-safe') return 'Đang xử lý lượt đêm'
  return TIMER_LABELS[timerContext] ?? 'Đang tính giờ'
}

export function getRoleDisplay(role?: Role | null) {
  if (!role) return null
  return LIST_ROLE.find((item) => item.id === role) ?? null
}

export function getWinnerLabel(winner?: keyof typeof WINNER_LABELS | null) {
  if (!winner) return null
  return WINNER_LABELS[winner]
}

export function derivePublicStats(players: Player[]) {
  const approvedPlayers = players.filter((player) => player.status === 'approved')
  const totalPlayers = approvedPlayers.length
  const alivePlayers = approvedPlayers.filter((player) => player.alive !== false).length

  return {
    totalPlayers,
    alivePlayers,
    deadPlayers: Math.max(totalPlayers - alivePlayers, 0),
  }
}

export function deriveVotingHud(
  votingProgress: VotingProgress | null,
  playerVotingState: PlayerVotingState | null | undefined,
  players: Player[],
) {
  if (!votingProgress && !playerVotingState) return null

  const aliveCount = players.filter(
    (player) => player.status === 'approved' && player.alive !== false,
  ).length
  const totalVoters = votingProgress?.totalVoters ?? aliveCount
  const respondedCount =
    votingProgress?.respondedCount ??
    votingProgress?.votedCount ??
    (playerVotingState?.hasResponded ? 1 : 0)

  return {
    respondedCount,
    totalVoters,
    hasResponded: playerVotingState?.hasResponded,
  }
}

export function shouldShowPlayerTimer(
  phase: HudPhase,
  role: Role | null | undefined,
  timerContext: HudTimerContext,
) {
  if (!timerContext) return false
  if (timerContext === 'voting') return phase === 'voting'
  return phase === 'night' && timerContext === role
}

export function getHudPhaseColorClass(phase: HudPhase) {
  const tone = getPhaseTone(phase)
  return tone.labelClass
}
