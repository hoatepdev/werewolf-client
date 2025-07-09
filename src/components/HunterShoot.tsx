// TODO: remove this component if not used
import React from 'react'
import { Player } from '@/types/player'

interface HunterShootProps {
  alivePlayers: Player[]
  onShoot: (id: string) => void
  pending?: boolean
  selectedId?: string
}

const HunterShoot: React.FC<HunterShootProps> = ({
  alivePlayers,
  onShoot,
  pending,
  selectedId,
}) => {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="text-center text-lg font-bold">You are the Hunter!</div>
      <div className="mb-2 text-center text-zinc-300">
        Choose a player to eliminate with your final shot.
      </div>
      <div className="flex w-full flex-col gap-2">
        {alivePlayers.map((p: Player) => (
          <button
            key={p.id}
            className="flex w-full items-center justify-center gap-2 rounded-xl border bg-zinc-800 py-2 font-semibold text-white hover:bg-red-500 hover:text-white"
            onClick={() => onShoot(p.id)}
            disabled={pending}
          >
            {pending && selectedId === p.id && (
              <svg
                className="h-5 w-5 animate-spin text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {p.username}
          </button>
        ))}
      </div>
    </div>
  )
}

export default HunterShoot
