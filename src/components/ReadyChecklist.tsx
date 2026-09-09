import { CheckCircle2, Clock3 } from 'lucide-react'
import { renderAvatar } from '@/helpers'
import { Player } from '@/types/player'

type ReadyChecklistProps = {
  players: Player[]
  title?: string
  currentPlayerId?: string
  assignedRoles?: boolean
}

export const ReadyChecklist = ({
  players,
  title = 'Trạng thái sẵn sàng',
  currentPlayerId,
  assignedRoles = true,
}: ReadyChecklistProps) => {
  const approvedPlayers = players.filter((player) => player.status === 'approved')
  const readyCount = approvedPlayers.filter((player) => player.ready).length
  const pendingPlayers = approvedPlayers.filter((player) => !player.ready)
  const totalCount = approvedPlayers.length
  const allReady = totalCount > 0 && readyCount === totalCount

  const summary = !assignedRoles
    ? 'Chờ quản trò phân vai'
    : allReady
      ? 'Tất cả đã sẵn sàng'
      : pendingPlayers.length > 0
        ? `Còn ${pendingPlayers.length} người chưa sẵn sàng`
        : 'Chưa có người chơi sẵn sàng'

  return (
    <section className="w-full border-y border-zinc-800 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          <p className="text-sm text-zinc-400">{summary}</p>
        </div>
        <div className="border-l-2 border-yellow-400 bg-yellow-400/10 px-3 py-1 text-sm font-bold text-yellow-300 tabular-nums">
          {readyCount}/{totalCount}
        </div>
      </div>

      {approvedPlayers.length === 0 ? (
        <div className="border-l-2 border-zinc-700 px-4 py-3 text-sm text-zinc-400">
          Chưa có người chơi được duyệt
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {approvedPlayers.map((player) => {
            const isReady = player.ready === true
            const isCurrentPlayer = player.id === currentPlayerId

            return (
              <li
                key={player.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-zinc-800 text-2xl text-yellow-400">
                    {renderAvatar(player)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {player.username}
                    </div>
                    {isCurrentPlayer && (
                      <div className="text-xs font-medium text-yellow-300">Bạn</div>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 border-l-2 px-2.5 py-1 text-xs font-semibold ${
                    isReady
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                      : 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                  }`}
                >
                  {isReady ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock3 className="h-3.5 w-3.5" />
                  )}
                  {isReady ? 'Đã sẵn sàng' : 'Chưa sẵn sàng'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
