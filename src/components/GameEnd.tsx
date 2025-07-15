import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Player } from '@/types/player'
import { LIST_ROLE } from '@/constants/role'

interface GameEndProps {
  winningTeam: string
  players: Player[]
  onReturn: () => void
  onPlayAgain: () => void
}

const GameEnd: React.FC<GameEndProps> = ({
  winningTeam,
  players,
  onReturn,
  onPlayAgain,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
    })
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="mb-2 text-center text-2xl font-bold">Kết thúc game</div>
      <div className="mb-2 text-center text-lg">
        Đội thắng:{' '}
        <span className="font-bold text-yellow-400">{winningTeam}</span>
      </div>
      <div className="w-full">
        <div className="mb-1 font-semibold">Người chơi</div>
        <ul className="divide-y divide-zinc-700">
          {players.map((p: Player) => (
            <li key={p.id} className="flex justify-between py-1">
              <span>
                {p.username}{' '}
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
      <div className="mt-4 flex w-full gap-2">
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
