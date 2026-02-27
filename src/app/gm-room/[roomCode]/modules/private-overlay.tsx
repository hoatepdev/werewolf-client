'use client'

import { motion } from 'framer-motion'
import { X, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Socket } from 'socket.io-client'
import type { Player, GameStats } from '@/types/player'
import type { NightActionData } from './types'
import type { GmLogEntry } from './types'
import { backdropVariants, overlayVariants } from '@/lib/motion'
import { PlayerList } from './player-list'
import { GameStatsCard } from './game-stats'
import { NightActionLog } from './night-action-log'
import { GameLog } from './game-log'
import { MockPlayersComponent } from './mock-player'
import { HoldToConfirmButton } from './hold-to-confirm-button'
import { Button } from '@/components/ui/button'

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

interface PrivateOverlayProps {
  onClose: () => void
  phase: string
  onNextPhase: () => void
  players: Player[]
  onEliminate: (player: Player, reason: string) => void
  onRevive: (playerId: string) => void
  gameStats: GameStats
  nightActions: NightActionData[]
  gmLogs: GmLogEntry[]
  socket: Socket
  forceRender: boolean
  setForceRender: (v: boolean) => void
  handleSetMockPlayers: (players: Player[]) => void
  winner: 'villagers' | 'werewolves' | 'tanner' | null
}

export function PrivateOverlay({
  onClose,
  phase,
  onNextPhase,
  players,
  onEliminate,
  onRevive,
  gameStats,
  nightActions,
  gmLogs,
  socket,
  forceRender,
  setForceRender,
  handleSetMockPlayers,
  winner,
}: PrivateOverlayProps) {
  const router = useRouter()
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
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content panel */}
      <motion.div
        className="relative z-10 w-full max-w-6xl rounded-t-2xl bg-zinc-900 p-6 shadow-2xl"
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
              🔒 Chế độ riêng tư
            </h2>
          )}
          <div className="flex items-center gap-3">
            {isGameEnded ? (
              <Button
                onClick={() => router.push('/create-room')}
                className="px-4 py-2 text-sm"
              >
                Tạo game mới
              </Button>
            ) : (
              <HoldToConfirmButton
                onConfirm={onNextPhase}
                className="px-4 py-2 text-sm"
              />
            )}
            <button
              onClick={onClose}
              className="rounded-full bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="mt-4 overflow-y-auto"
          style={{ maxHeight: 'calc(95vh - 180px)' }}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Player list with full controls */}
            <PlayerList
              players={players}
              onEliminate={onEliminate}
              onRevive={onRevive}
              readOnly={isGameEnded}
            />

            {/* Game stats with faction info */}
            <GameStatsCard gameStats={gameStats} />
          </div>

          {/* Night action log */}
          <NightActionLog nightActions={nightActions} />

          {/* Full game log */}
          <GameLog logs={gmLogs} filtered={false} />

          {/* Mock players (dev tool) - hide when game ended */}
          {!isGameEnded && (
            <MockPlayersComponent
              socket={socket}
              forceRender={forceRender}
              setForceRender={setForceRender}
              handleSetMockPlayers={handleSetMockPlayers}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
