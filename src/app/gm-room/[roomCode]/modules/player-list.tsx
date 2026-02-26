import { memo } from 'react'
import { renderAvatar } from '@/helpers'
import type { Player } from '@/types/player'

interface PlayerListProps {
  players: Player[]
  onEliminate: (player: Player, reason: string) => void
  onRevive: (playerId: string) => void
}

export const PlayerList = memo(function PlayerList({
  players,
  onEliminate,
  onRevive,
}: PlayerListProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h2 className="mb-4 text-lg font-bold text-purple-400">
        👥 Danh sách người chơi
      </h2>
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có người chơi nào...</p>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 rounded-lg p-3 ${
                player.alive ? 'bg-gray-700' : 'bg-red-900/50'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
                {renderAvatar(player)}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${player.alive ? 'text-white' : 'text-red-300'}`}
                >
                  {player.username}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded px-2 py-1 ${
                      player.role === 'werewolf'
                        ? 'bg-red-600'
                        : player.role === 'seer'
                          ? 'bg-blue-600'
                          : player.role === 'witch'
                            ? 'bg-purple-600'
                            : player.role === 'hunter'
                              ? 'bg-orange-600'
                              : player.role === 'bodyguard'
                                ? 'bg-green-600'
                                : player.role === 'tanner'
                                  ? 'bg-yellow-600'
                                  : 'bg-gray-600'
                    }`}
                  >
                    {player.role || 'Chưa phân vai'}
                  </span>
                  <span
                    className={`rounded px-2 py-1 ${player.alive ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {player.alive ? 'Sống' : 'Chết'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {player.alive ? (
                  <button
                    onClick={() => onEliminate(player, 'GM loại bỏ')}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium hover:bg-red-700"
                  >
                    Loại bỏ
                  </button>
                ) : (
                  <button
                    onClick={() => onRevive(player.id)}
                    className="rounded bg-green-600 px-2 py-1 text-xs font-medium hover:bg-green-700"
                  >
                    Hồi sinh
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})
