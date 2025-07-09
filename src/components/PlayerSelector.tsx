// TODO: remove this component if not used
import React from 'react'
import { Player } from '@/types/player'

interface PlayerSelectorProps {
  players: Player[]
  selectedId?: string
  onSelect: (id: string) => void
  disabled?: boolean
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  selectedId,
  onSelect,
  disabled,
}) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {players.map((p: Player) => (
        <button
          key={p.id}
          className={`w-full rounded-xl border py-2 font-semibold ${selectedId === p.id ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-white'}`}
          onClick={() => onSelect(p.id)}
          disabled={disabled}
        >
          {p.username}
        </button>
      ))}
    </div>
  )
}

export default PlayerSelector
