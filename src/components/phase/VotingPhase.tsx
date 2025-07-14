import React, { useState } from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import PhaseTransitionImage from '../PhaseTransitionImage'
import { PlayerGrid } from '../PlayerGrid'

const VotingPhase: React.FC = () => {
  const { approvedPlayers } = useRoomStore()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  } | null>(null)

  return (
    <div className="relative h-full w-full flex-1">
      <PhaseTransitionImage
        image="/images/phase/voting.gif"
        bgColor="#2E3A62"
      />

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-yellow-400">
            👥 Giai đoạn bỏ phiếu
          </h3>
          <p className="text-sm text-gray-300">
            Mời mọi người bỏ phiếu cho người mà bạn cho là người chết trong đêm
          </p>
        </div>

        <div className="w-full">
          <PlayerGrid
            players={approvedPlayers}
            mode="room"
            onSelect={(player) => setSelectedTarget(player)}
            selectableList={approvedPlayers.filter((p) => p.alive)}
          />
        </div>
      </div>
    </div>
  )
}

export default VotingPhase
