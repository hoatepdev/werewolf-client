'use client'

import React from 'react'
import { Player } from '@/types/player'
import { LIST_ROLE } from '@/constants/role'
import type { GameLogEntry } from '@/types/game-log'
import GameHistoryLog from '@/components/GameHistoryLog'

type WinnerType = 'villagers' | 'werewolves' | 'tanner'

const WINNER_DISPLAY: Record<
  WinnerType,
  { name: string; emoji: string; color: string }
> = {
  villagers: { name: 'Dân làng', emoji: '🏘️', color: 'text-blue-400' },
  werewolves: { name: 'Sói', emoji: '🐺', color: 'text-red-400' },
  tanner: { name: 'Chán đời', emoji: '😈', color: 'text-purple-400' },
}

interface GameEndProps {
  winningTeam: WinnerType
  players: Player[]
  currentPlayerId?: string | null
  gameLog?: GameLogEntry[]
  onReturn: () => void
  onPlayAgain: () => void
}

const GameEnd: React.FC<GameEndProps> = ({
  winningTeam,
  players,
  currentPlayerId,
  gameLog,
  onReturn,
  onPlayAgain,
}) => {
  const config = WINNER_DISPLAY[winningTeam]

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="mb-2 text-center text-2xl font-bold">Kết thúc game</div>
      <div className="mb-2 flex items-center justify-center gap-2 text-lg">
        <span className="text-3xl">{config.emoji}</span>
        <span className="font-bold text-yellow-400">{config.name}</span>
        <span className="text-3xl">{config.emoji}</span>
      </div>
      <div className="w-full">
        <div className="mb-1 font-semibold">Người chơi</div>
        <ul className="divide-y divide-zinc-700">
          {players.map((p: Player) => (
            <li key={p.id} className="flex justify-between py-1">
              <span>
                <span className={p.id === currentPlayerId ? 'font-bold text-yellow-400' : ''}>
                  {p.username}
                </span>{' '}
                <span className="text-xs text-zinc-400">
                  ({LIST_ROLE.find((r) => r.id === p.role)?.name})
                </span>
              </span>
              <span className={p.alive ? 'text-green-400' : 'text-red-400'}>
                {p.alive ? 'Sống' : 'Chết'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <GameHistoryLog
        gameLog={gameLog}
        title="Diễn biến trận đấu"
        revealDetails
      />

      <div className="mt-4 flex w-full gap-4">
        <button
          className="flex-1 rounded-xl bg-zinc-700 py-2 text-white"
          onClick={onReturn}
        >
          Về trang chủ
        </button>
        <button
          className="flex-1 rounded-xl bg-yellow-400 py-2 font-semibold text-black"
          onClick={onPlayAgain}
        >
          Chơi lại
        </button>
      </div>
    </div>
  )
}

export default GameEnd
