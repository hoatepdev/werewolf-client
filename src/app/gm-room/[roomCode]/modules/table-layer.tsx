'use client'

import type { AudioEvent, AudioStatus } from './types'
import type { Player, GameStats } from '@/types/player'
import type { GmLogEntry } from './types'
import { Button } from '@/components/ui/button'
import { AudioControl } from './audio-control'
import { AudioQueue } from './audio-queue'
import { SafePlayerList } from './player-list-safe'
import { SafeGameStats } from './game-stats-safe'
import { GameLog } from './game-log'
import { HoldToConfirmButton } from './hold-to-confirm-button'
import { PrivateTrigger } from './private-trigger'

interface TableLayerProps {
  phase: string
  onNextPhase: () => void
  currentAudio: AudioEvent | null
  isPlaying: boolean
  audioStatus: AudioStatus
  stopAudio: () => void
  audioQueue: AudioEvent[]
  playAudio: (audio: AudioEvent | null) => void
  players: Player[]
  gameStats: GameStats
  gmLogs: GmLogEntry[]
  onActivatePrivate: () => void
  onRefresh: () => void
}

export function TableLayer({
  phase,
  onNextPhase,
  currentAudio,
  isPlaying,
  audioStatus,
  stopAudio,
  audioQueue,
  playAudio,
  players,
  gameStats,
  gmLogs,
  onActivatePrivate,
  onRefresh,
}: TableLayerProps) {
  const phaseLabel =
    phase === 'night'
      ? 'Đêm'
      : phase === 'day'
        ? 'Ngày'
        : phase === 'voting'
          ? 'Bỏ phiếu'
          : phase === 'ended'
            ? 'Kết thúc'
            : 'Chưa bắt đầu'

  const phaseColor =
    phase === 'night'
      ? 'bg-blue-600'
      : phase === 'day'
        ? 'bg-yellow-600'
        : phase === 'voting'
          ? 'bg-red-600'
          : phase === 'ended'
            ? 'bg-gray-600'
            : 'bg-gray-600'

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

      {/* Game log */}
      <GameLog logs={gmLogs} filtered />

      {/* Safe game stats */}
      <SafeGameStats gameStats={gameStats} />

      {/* Private mode trigger */}
      <PrivateTrigger onActivate={onActivatePrivate} />
    </>
  )
}
