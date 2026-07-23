'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPhaseDescription, getPhaseTone, getWinnerLabel } from './GameHud.helpers'
import type { GameHudProps } from './GameHud.types'
import { HudPlayerStrip } from './HudPlayerStrip'
import { HudProgress } from './HudProgress'
import { HudStatPill } from './HudStatPill'
import { HudTimer } from './HudTimer'
import { PhaseBadge } from './PhaseBadge'
import { formatRoomCode } from '@/lib/room-code'

export function GameHud({
  mode,
  roomCode,
  phase,
  isConnected,
  winner,
  identity,
  stats,
  voting,
  timer,
  timerVisibility,
  privateModeActive,
  actions,
  compact = false,
  className,
}: GameHudProps) {
  const tone = getPhaseTone(phase)
  const winnerInfo = getWinnerLabel(winner)
  const resolvedTimerVisibility =
    timerVisibility ??
    (mode === 'player'
      ? 'player-self'
      : mode === 'gm-private'
        ? 'gm-private'
        : 'gm-safe')

  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-2xl border bg-zinc-950/85 p-3 text-zinc-100 shadow-2xl backdrop-blur-md',
        tone.borderClass,
        tone.glowClass,
        compact ? 'space-y-3' : 'space-y-4',
        className,
      )}
      aria-label="Bảng trạng thái ván chơi"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Phòng
            </p>
            <p className="text-lg font-black tracking-[0.35em] text-yellow-300">
              {formatRoomCode(roomCode)}
            </p>
          </div>

          {mode === 'player' && identity ? (
            <HudPlayerStrip identity={identity} className="min-w-0 flex-1" />
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <PhaseBadge phase={phase} />
                {typeof isConnected === 'boolean' && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1',
                      isConnected
                        ? 'bg-green-500/15 text-green-200 ring-green-400/30'
                        : 'bg-red-500/15 text-red-200 ring-red-400/30',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        isConnected ? 'bg-green-400' : 'bg-red-400',
                      )}
                    />
                    {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                  </span>
                )}
                {privateModeActive && (
                  <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200 ring-1 ring-purple-400/30">
                    🔒 Riêng tư
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-zinc-400">
                {winnerInfo
                  ? `${winnerInfo.emoji} ${winnerInfo.name} thắng!`
                  : getPhaseDescription(phase, mode)}
              </p>
            </div>
          )}
        </div>

        {mode === 'player' && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <PhaseBadge phase={phase} />
            {winnerInfo && (
              <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-100 ring-1 ring-yellow-300/30">
                {winnerInfo.emoji} {winnerInfo.name} thắng
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {stats && (
            <>
              <HudStatPill label="Tổng" value={stats.totalPlayers} />
              <HudStatPill label="Sống" value={stats.alivePlayers} tone="good" />
              <HudStatPill label="Chết" value={stats.deadPlayers} tone="danger" />
            </>
          )}
          {mode === 'player' && identity?.alive === false && (
            <HudStatPill label="Trạng thái" value="Đã chết" tone="danger" />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <HudTimer timer={timer} visibility={resolvedTimerVisibility} />
          <HudProgress voting={voting} />
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800 pt-3">
          {actions.onOpenPrivate && (
            <Button
              type="button"
              onClick={actions.onOpenPrivate}
              className="w-auto px-3 py-2 text-sm"
              variant="yellow"
            >
              🔒 Riêng tư
            </Button>
          )}
          {actions.onRefresh && (
            <Button
              type="button"
              onClick={actions.onRefresh}
              className="w-auto px-3 py-2 text-sm"
            >
              Làm mới
            </Button>
          )}
          {actions.onNextPhase && phase !== 'ended' && (
            <Button
              type="button"
              onClick={actions.onNextPhase}
              className="w-auto px-3 py-2 text-sm"
              variant="yellow"
            >
              Giai đoạn tiếp theo
            </Button>
          )}
          {actions.onLeave && (
            <Button
              type="button"
              onClick={actions.onLeave}
              className="w-auto px-3 py-2 text-sm"
              variant="black"
            >
              {mode === 'player' ? 'Rời ván' : 'Rời phòng'}
            </Button>
          )}
        </div>
      )}
    </motion.section>
  )
}
