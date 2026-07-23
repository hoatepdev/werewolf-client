'use client'

import type { Phase } from '@/hook/useRoomStore'
import { useTimer } from '@/hook/useTimerContext'
import type { GameStats, Player } from '@/types/player'
import { derivePublicStats } from './GameHud.helpers'
import { GameHud } from './GameHud'
import type { HudTimer } from './GameHud.types'

type GmGameHudContainerProps = {
  roomCode: string
  isConnected: boolean
  phase: Phase | null
  players: Player[]
  gameStats?: GameStats
  winner?: 'villagers' | 'werewolves' | 'tanner' | null
  isPrivateMode?: boolean
  mode?: 'gm-safe' | 'gm-private'
  onLeave?: () => void
  onRefresh?: () => void
  onNextPhase?: () => void
  onOpenPrivate?: () => void
  compact?: boolean
  className?: string
}

export function GmGameHudContainer({
  roomCode,
  isConnected,
  phase,
  players,
  gameStats,
  winner,
  isPrivateMode = false,
  mode = isPrivateMode ? 'gm-private' : 'gm-safe',
  onLeave,
  onRefresh,
  onNextPhase,
  onOpenPrivate,
  compact,
  className,
}: GmGameHudContainerProps) {
  const timer = useTimer()
  const stats = gameStats
    ? {
        totalPlayers: gameStats.totalPlayers,
        alivePlayers: gameStats.alivePlayers,
        deadPlayers: gameStats.deadPlayers,
      }
    : derivePublicStats(players)
  const hudTimer: HudTimer | null = timer.timerContext ? timer : null

  return (
    <GameHud
      mode={mode}
      roomCode={roomCode}
      phase={phase}
      isConnected={isConnected}
      winner={winner}
      stats={stats}
      timer={hudTimer}
      timerVisibility={mode === 'gm-private' ? 'gm-private' : 'gm-safe'}
      privateModeActive={isPrivateMode}
      actions={{ onLeave, onRefresh, onNextPhase, onOpenPrivate }}
      compact={compact}
      className={className}
    />
  )
}
