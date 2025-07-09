// TODO: remove this component if not used
import React from 'react'
import { Player } from '@/types/player'

interface VotingPhaseProps {
  alivePlayers: Player[]
  votedId?: string
  onVote: (id: string) => void
  pending?: boolean
}

const VotingPhase: React.FC<VotingPhaseProps> = ({
  alivePlayers,
  votedId,
  onVote,
  pending,
}) => {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="text-center text-lg font-bold">Voting Phase</div>
      <div className="flex w-full flex-col gap-2">
        {alivePlayers.map((p: Player) => (
          <button
            key={p.id}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2 font-semibold ${votedId === p.id ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-white'}`}
            onClick={() => onVote(p.id)}
            disabled={pending}
          >
            {pending && votedId === p.id && (
              <svg
                className="h-5 w-5 animate-spin text-black"
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

export default VotingPhase
