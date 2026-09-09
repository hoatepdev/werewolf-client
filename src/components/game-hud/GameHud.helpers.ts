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
    labelClass: 'border-blue-400 bg-blue-500/10 text-blue-200',
    borderClass: 'border-blue-400/50',
    glowClass: '',
    dotClass: 'bg-blue-400',
  },
  day: {
    labelClass: 'border-yellow-300 bg-yellow-400/10 text-yellow-200',
    borderClass: 'border-yellow-300/50',
    glowClass: '',
    dotClass: 'bg-yellow-300',
  },
  voting: {
    labelClass: 'border-red-400 bg-red-500/10 text-red-200',
    borderClass: 'border-red-400/50',
    glowClass: '',
    dotClass: 'bg-red-400',
  },
  conclude: {
    labelClass: 'border-yellow-400 bg-yellow-400/10 text-yellow-100',
    borderClass: 'border-yellow-400/50',
    glowClass: '',
    dotClass: 'bg-yellow-400',
  },
  ended: {
    labelClass: 'border-zinc-400 bg-zinc-500/10 text-zinc-200',
    borderClass: 'border-zinc-500',
    glowClass: '',
    dotClass: 'bg-zinc-300',
  },
  idle: {
    labelClass: 'border-zinc-500 bg-zinc-800 text-zinc-200',
    borderClass: 'border-zinc-700',
    glowClass: '',
    dotClass: 'bg-zinc-400',
  },
}

const TIMER_LABELS: Record<string, string> = {
  cupid: 'Lượt Thần tình yêu',
  bodyguard: 'Lượt Bảo vệ',
  werewolf: 'Lượt Sói',
  witch: 'Lượt Phù thủy',
  seer: 'Lượt Tiên tri',
  day: 'Thời gian thảo luận',
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
  if (timerContext === 'day') return TIMER_LABELS.day
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
  if (timerContext === 'day') return phase === 'day'
  if (timerContext === 'voting') return phase === 'voting'
  return phase === 'night' && timerContext === role
}

export function getHudPhaseColorClass(phase: HudPhase) {
  const tone = getPhaseTone(phase)
  return tone.labelClass
}
