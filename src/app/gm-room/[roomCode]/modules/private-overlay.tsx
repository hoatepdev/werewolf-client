'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
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
}: PrivateOverlayProps) {
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
          <h2 className="text-xl font-bold text-yellow-400">
            🔒 Chế độ riêng tư
          </h2>
          <div className="flex items-center gap-3">
            <HoldToConfirmButton
              onConfirm={onNextPhase}
              className="px-4 py-2 text-sm"
            />
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
            />

            {/* Game stats with faction info */}
            <GameStatsCard gameStats={gameStats} />
          </div>

          {/* Night action log */}
          <NightActionLog nightActions={nightActions} />

          {/* Full game log */}
          <GameLog logs={gmLogs} filtered={false} />

          {/* Mock players (dev tool) */}
          <MockPlayersComponent
            socket={socket}
            forceRender={forceRender}
            setForceRender={setForceRender}
            handleSetMockPlayers={handleSetMockPlayers}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
