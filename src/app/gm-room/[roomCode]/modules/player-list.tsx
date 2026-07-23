'use client'

import { memo, useState } from 'react'
import { toast } from 'sonner'
import { renderAvatar } from '@/helpers'
import { confirmDialog } from '@/components/ui/alert-dialog'
import type { Player } from '@/types/player'

interface PlayerListProps {
  players: Player[]
  onEliminate: (player: Player, reason: string) => Promise<boolean>
  onRevive: (playerId: string) => Promise<boolean>
  readOnly?: boolean
  pendingGmCommand?: string | null
}

export const PlayerList = memo(function PlayerList({
  players,
  onEliminate,
  onRevive,
  readOnly = false,
  pendingGmCommand,
}: PlayerListProps) {
  const [eliminatingPlayerId, setEliminatingPlayerId] = useState<string | null>(
    null,
  )
  const [reason, setReason] = useState('')

  const isBusy = Boolean(pendingGmCommand)

  const openEliminateForm = (playerId: string) => {
    setEliminatingPlayerId(playerId)
    setReason('')
  }

  const cancelEliminate = () => {
    setEliminatingPlayerId(null)
    setReason('')
  }

  const submitEliminate = async (player: Player) => {
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      toast.error('Vui lòng nhập lý do loại bỏ.')
      return
    }

    const success = await onEliminate(player, trimmedReason)
    if (success) cancelEliminate()
  }

  const handleRevive = async (player: Player) => {
    const confirmed = await confirmDialog({
      title: `Hồi sinh ${player.username}?`,
      description:
        'Người chơi này sẽ được đưa về trạng thái sống. GM cần tự điều hành lại nhịp game nếu thao tác diễn ra giữa phase đặc biệt.',
      confirmText: 'Hồi sinh',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    void onRevive(player.id)
  }

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h2 className="mb-4 text-lg font-bold text-purple-400">
        👥 Danh sách người chơi
      </h2>
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có người chơi nào...</p>
        ) : (
          players.map((player) => {
            const isEliminating = eliminatingPlayerId === player.id
            const commandForPlayer = pendingGmCommand?.endsWith(`:${player.id}`)

            return (
              <div
                key={player.id}
                className={`rounded-lg p-3 ${
                  player.alive ? 'bg-gray-700' : 'bg-red-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
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
                                      : player.role === 'cupid'
                                        ? 'bg-pink-600'
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
                  {!readOnly && (
                    <div className="flex gap-2">
                      {player.alive ? (
                        <button
                          type="button"
                          onClick={() => openEliminateForm(player.id)}
                          disabled={isBusy}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-medium hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {commandForPlayer ? 'Đang xử lý...' : 'Loại bỏ'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleRevive(player)}
                          disabled={isBusy}
                          className="rounded bg-green-600 px-2 py-1 text-xs font-medium hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {commandForPlayer ? 'Đang xử lý...' : 'Hồi sinh'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEliminating && !readOnly && (
                  <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/30 p-3">
                    <label className="text-xs font-medium text-red-200">
                      Lý do loại bỏ
                      <input
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={120}
                        placeholder="VD: GM loại bỏ do sự cố kỹ thuật"
                        className="mt-2 w-full rounded border border-red-500/30 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-red-400 focus:outline-none"
                        disabled={isBusy}
                      />
                    </label>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEliminate}
                        disabled={isBusy}
                        className="rounded bg-zinc-700 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => void submitEliminate(player)}
                        disabled={isBusy}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Xác nhận loại bỏ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
})
