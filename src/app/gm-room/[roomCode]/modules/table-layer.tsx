'use client'

import type { AudioEvent, AudioStatus } from './types'
import type { GameLogEntry } from '@/types/game-log'
import type { Player, GameStats } from '@/types/player'
import type { GmLogEntry } from './types'
import { Clock, FastForward, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AudioControl } from './audio-control'
import { AudioQueue } from './audio-queue'
import { SafePlayerList } from './player-list-safe'
import { SafeGameStats } from './game-stats-safe'
import { GameLog } from './game-log'
import GameHistoryLog from '@/components/GameHistoryLog'
import { HoldToConfirmButton } from './hold-to-confirm-button'
import { PrivateTrigger } from './private-trigger'
import { getHudPhaseColorClass, getPhaseLabel } from '@/components/game-hud'

interface TableLayerProps {
  phase: string
  onNextPhase: () => void
  onStartDayTimer: (durationMs?: number) => void | Promise<boolean>
  onExtendDayTimer: (deltaMs: number) => void | Promise<boolean>
  onSkipDayTimer: () => void | Promise<boolean>
  currentAudio: AudioEvent | null
  isPlaying: boolean
  audioStatus: AudioStatus
  stopAudio: () => void
  audioQueue: AudioEvent[]
  playAudio: (audio: AudioEvent | null) => void
  players: Player[]
  gameStats: GameStats
  gameLog: GameLogEntry[]
  gmLogs: GmLogEntry[]
  onActivatePrivate: () => void
  onRefresh: () => void
}

export function TableLayer({
  phase,
  onNextPhase,
  onStartDayTimer,
  onExtendDayTimer,
  onSkipDayTimer,
  currentAudio,
  isPlaying,
  audioStatus,
  stopAudio,
  audioQueue,
  playAudio,
  players,
  gameStats,
  gameLog,
  gmLogs,
  onActivatePrivate,
  onRefresh,
}: TableLayerProps) {
  const phaseLabel = getPhaseLabel(phase as Parameters<typeof getPhaseLabel>[0])
  const phaseColor = getHudPhaseColorClass(
    phase as Parameters<typeof getHudPhaseColorClass>[0],
  )

  return (
    <>
      {/* Game controls */}
      <div>
        <h2 className="mb-8 text-lg font-bold text-purple-400">
          🎮 Điều khiển game
        </h2>
        <div className="flex items-center gap-4">
          {phase === 'ended' ? (
            <span className="rounded bg-gray-600 px-4 py-2 text-sm font-medium">
              Game đã kết thúc
            </span>
          ) : (
            <HoldToConfirmButton onConfirm={onNextPhase} />
          )}
          <Button onClick={onRefresh}>Làm mới danh sách</Button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-300">Giai đoạn hiện tại:</span>
          <span
            className={`rounded px-2 py-1 text-sm font-medium ${phaseColor}`}
          >
            {phaseLabel}
          </span>
        </div>

        {phase === 'day' && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-yellow-400/20 bg-yellow-950/20 p-3">
            <span className="mr-2 flex items-center gap-2 text-sm font-semibold text-yellow-200">
              <Clock className="h-4 w-4" />
              Timer ngày
            </span>
            <Button
              type="button"
              variant="black"
              onClick={() => onStartDayTimer(3 * 60 * 1000)}
              className="gap-2 text-xs"
            >
              <Clock className="h-4 w-4" />
              Bắt đầu 3 phút
            </Button>
            <Button
              type="button"
              variant="black"
              onClick={() => onExtendDayTimer(30 * 1000)}
              className="gap-2 text-xs"
            >
              <Plus className="h-4 w-4" />
              +30 giây
            </Button>
            <Button
              type="button"
              onClick={onSkipDayTimer}
              className="gap-2 bg-orange-600 text-xs text-white hover:bg-orange-700"
            >
              <FastForward className="h-4 w-4" />
              Kết thúc thảo luận
            </Button>
          </div>
        )}
      </div>

      {/* Two-column layout: Audio | Players */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AudioControl
            currentAudio={currentAudio}
            isPlaying={isPlaying}
            audioStatus={audioStatus}
            stopAudio={stopAudio}
          />
          <AudioQueue audioQueue={audioQueue} playAudio={playAudio} />
        </div>
        <SafePlayerList players={players} />
      </div>

      {/* Match history */}
      <GameHistoryLog
        gameLog={gameLog}
        title="Nhật ký trận đấu"
        compact
        showEmptyState
        revealDetails
      />

      {/* GM action log */}
      <GameLog logs={gmLogs} filtered />

      {/* Safe game stats */}
      <SafeGameStats gameStats={gameStats} />

      {/* Private mode trigger */}
      <PrivateTrigger onActivate={onActivatePrivate} />
    </>
  )
}
