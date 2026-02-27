import { memo } from 'react'
import type { GameStats } from '@/types/player'

interface SafeGameStatsProps {
  gameStats: GameStats
}

export const SafeGameStats = memo(function SafeGameStats({
  gameStats,
}: SafeGameStatsProps) {
  return (
    <div className="mt-6 rounded-lg bg-gray-800 p-6">
      <h2 className="mb-4 text-lg font-bold text-green-400">
        📊 Thống kê game
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {gameStats.totalPlayers}
          </p>
          <p className="text-sm text-gray-400">Tổng</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {gameStats.alivePlayers}
          </p>
          <p className="text-sm text-gray-400">Sống</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">
            {gameStats.deadPlayers}
          </p>
          <p className="text-sm text-gray-400">Chết</p>
        </div>
      </div>
    </div>
  )
})
