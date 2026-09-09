'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Socket } from 'socket.io-client'
import type { GameLogEntry } from '@/types/game-log'
import type { Player, GameStats } from '@/types/player'
import type { GmLogEntry, NightActionData, VotingProgress } from './types'
import { backdropVariants, overlayVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { PlayerList } from './player-list'
import { GameStatsCard } from './game-stats'
import { NightActionLog } from './night-action-log'
import { GameLog } from './game-log'
import GameHistoryLog from '@/components/GameHistoryLog'
import { MockPlayersComponent } from './mock-player'
import { Button } from '@/components/ui/button'
import { GmGameHudContainer } from '@/components/game-hud'
import { GmToolsCard } from './gm-tools-card'

const WINNER_DISPLAY = {
  villagers: {
    name: 'Dân làng',
    emoji: '👨‍🌾',
    color: 'text-blue-400',
    bg: 'bg-blue-600',
  },
  werewolves: {
    name: 'Sói',
    emoji: '🐺',
    color: 'text-red-400',
    bg: 'bg-red-600',
  },
  tanner: {
    name: 'Chán đời',
    emoji: '😫',
    color: 'text-purple-400',
    bg: 'bg-purple-600',
  },
} as const

const TABS = [
  { id: 'controls', label: 'Điều khiển' },
  { id: 'players', label: 'Người chơi' },
  { id: 'logs', label: 'Nhật ký' },
] as const

type TabId = (typeof TABS)[number]['id']

interface PrivateOverlayProps {
  onClose: () => void
  roomCode: string
  isConnected: boolean
  phase: string
  onNextPhase: () => void
  onRefresh: () => void
  onResetRoom: () => void
  onStartDayTimer: (durationMs?: number) => void | Promise<boolean>
  onExtendDayTimer: (deltaMs: number) => void | Promise<boolean>
  onSkipDayTimer: () => void | Promise<boolean>
  players: Player[]
  onEliminate: (player: Player, reason: string) => Promise<boolean>
  onRevive: (playerId: string) => Promise<boolean>
  gameStats: GameStats
  nightActions: NightActionData[]
  gameLog: GameLogEntry[]
  gmLogs: GmLogEntry[]
  socket: Socket
  forceRender: boolean
  setForceRender: (v: boolean) => void
  handleSetMockPlayers: (players: Player[]) => void
  winner: 'villagers' | 'werewolves' | 'tanner' | null
  gmCommandError?: string | null
  pendingGmCommand?: string | null
  votingProgress?: VotingProgress | null
}

export function PrivateOverlay({
  onClose,
  roomCode,
  isConnected,
  phase,
  onNextPhase,
  onRefresh,
  onResetRoom,
  onStartDayTimer,
  onExtendDayTimer,
  onSkipDayTimer,
  players,
  onEliminate,
  onRevive,
  gameStats,
  nightActions,
  gameLog,
  gmLogs,
  socket,
  forceRender,
  setForceRender,
  handleSetMockPlayers,
  winner,
  gmCommandError,
  pendingGmCommand,
  votingProgress,
}: PrivateOverlayProps) {
  const [tab, setTab] = useState<TabId>('controls')
  const isGameEnded = phase === 'ended'
  const winnerInfo = winner ? WINNER_DISPLAY[winner] : null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Content panel */}
      <motion.div
        className="relative z-10 w-full max-w-6xl border-t border-zinc-700 bg-zinc-900 p-6"
        style={{ maxHeight: '95vh' }}
        variants={overlayVariants}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
          {isGameEnded && winnerInfo ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{winnerInfo.emoji}</span>
              <h2 className={`text-xl font-bold ${winnerInfo.color}`}>
                Kết thúc — {winnerInfo.name} thắng!
              </h2>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-yellow-400">
              Chế độ riêng tư
            </h2>
          )}
          <div className="flex items-center gap-3">
            {isGameEnded && (
              <Button onClick={onResetRoom} className="px-4 py-2 text-sm">
                Chơi lại phòng này
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-sm bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <GmGameHudContainer
          roomCode={roomCode}
          isConnected={isConnected}
          phase={phase as Parameters<typeof GmGameHudContainer>[0]['phase']}
          players={players}
          gameStats={gameStats}
          winner={winner}
          isPrivateMode
          mode="gm-private"
          compact
          className="mt-4"
        />

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Công cụ GM"
          className="mt-4 flex gap-6 border-b border-zinc-700"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 pb-2 text-sm font-semibold',
                tab === t.id
                  ? 'border-yellow-400 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="mt-4 overflow-y-auto"
          style={{ maxHeight: 'calc(95vh - 260px)' }}
        >
          {tab === 'controls' && (
            <GmToolsCard
              phase={phase}
              commandError={gmCommandError}
              pendingGmCommand={pendingGmCommand}
              votingProgress={votingProgress}
              onNextPhase={onNextPhase}
              onRefresh={onRefresh}
              onResetRoom={onResetRoom}
              onStartDayTimer={onStartDayTimer}
              onExtendDayTimer={onExtendDayTimer}
              onSkipDayTimer={onSkipDayTimer}
            />
          )}

          {tab === 'players' && (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PlayerList
                  players={players}
                  onEliminate={onEliminate}
                  onRevive={onRevive}
                  readOnly={isGameEnded}
                  pendingGmCommand={pendingGmCommand}
                />
                <GameStatsCard gameStats={gameStats} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Lưu ý: loại bỏ/hồi sinh thủ công chỉ chỉnh trạng thái sống/chết.
                Nếu đang giữa lượt đặc biệt, GM vẫn cần điều hành nhịp chơi phù
                hợp.
              </p>
            </>
          )}

          {tab === 'logs' && (
            <>
              <NightActionLog nightActions={nightActions} />
              <GameHistoryLog
                gameLog={gameLog}
                title="Nhật ký trận đấu"
                initiallyExpanded={isGameEnded}
                compact
                showEmptyState
                revealDetails
              />
              <GameLog logs={gmLogs} filtered={false} />
              {process.env.NODE_ENV !== 'production' && !isGameEnded && (
                <MockPlayersComponent
                  socket={socket}
                  forceRender={forceRender}
                  setForceRender={setForceRender}
                  handleSetMockPlayers={handleSetMockPlayers}
                />
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
