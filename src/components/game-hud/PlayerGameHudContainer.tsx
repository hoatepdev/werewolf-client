'use client'

import { useRoomStore } from '@/hook/useRoomStore'
import { useTimer } from '@/hook/useTimerContext'
import { derivePublicStats, deriveVotingHud, shouldShowPlayerTimer } from './GameHud.helpers'
import { GameHud } from './GameHud'
import type { HudTimer } from './GameHud.types'

type PlayerGameHudContainerProps = {
  roomCode: string
  onLeave: () => void
  className?: string
}

export function PlayerGameHudContainer({
  roomCode,
  onLeave,
  className,
}: PlayerGameHudContainerProps) {
  const {
    username,
    avatarKey,
    role,
    phase,
    alive,
    approvedPlayers,
    votingProgress,
    playerVotingState,
    loverPartner,
  } = useRoomStore()
  const timer = useTimer()
  const showTimer = shouldShowPlayerTimer(phase, role, timer.timerContext)
  const hudTimer: HudTimer | null = showTimer ? timer : null

  return (
    <GameHud
      mode="player"
      roomCode={roomCode}
      phase={phase}
      identity={{
        username,
        avatarKey,
        role,
        alive,
        loverPartnerName: loverPartner?.username ?? null,
      }}
      stats={derivePublicStats(approvedPlayers)}
      voting={phase === 'voting' ? deriveVotingHud(votingProgress, playerVotingState, approvedPlayers) : null}
      timer={hudTimer}
      timerVisibility="player-self"
      actions={{ onLeave }}
      className={className}
    />
  )
}
