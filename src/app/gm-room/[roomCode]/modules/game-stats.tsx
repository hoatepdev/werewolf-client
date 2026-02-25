import type { GameStats } from '@/types/player'

export const GameStatsCard = ({ gameStats }: { gameStats: GameStats }) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-green-400">📊 Thống kê game</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-white">
          {gameStats.totalPlayers}
        </p>
        <p className="text-sm text-gray-400">Tổng người chơi</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-400">
          {gameStats.alivePlayers}
        </p>
        <p className="text-sm text-gray-400">Còn sống</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-400">
          {gameStats.deadPlayers}
        </p>
        <p className="text-sm text-gray-400">Đã chết</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-400">
          {gameStats.werewolves}
        </p>
        <p className="text-sm text-gray-400">Sói còn sống</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-400">
          {gameStats.villagers}
        </p>
        <p className="text-sm text-gray-400">Dân làng còn sống</p>
      </div>
    </div>
  </div>
)
