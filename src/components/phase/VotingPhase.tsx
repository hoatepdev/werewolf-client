import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'
import PhaseTransitionImage from '../PhaseTransitionImage'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { checkWinCondition, getWinnerDisplayName } from '@/helpers/winConditions'

const VotingPhase: React.FC = () => {
  const socket = getSocket()
  const {
    playerId,
    approvedPlayers,
    roomCode,
    setApprovedPlayers,
    setAlive,
    role,
    setHunterDeathShooting,
  } = useRoomStore()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  } | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const handleVotingResult = (data: {
      eliminatedPlayerId: string
      cause: 'vote' | 'hunter'
    }) => {
      const newApprovedPlayers = [...approvedPlayers]
      const foundPlayerIndex = approvedPlayers.findIndex(
        (player) => player.id === data.eliminatedPlayerId,
      )
      if (foundPlayerIndex !== -1) {
        newApprovedPlayers[foundPlayerIndex].alive = false
        setApprovedPlayers(newApprovedPlayers)
      }
      if (data.eliminatedPlayerId === playerId) {
        setAlive(false)
        // Check if the eliminated player is a hunter
        const eliminatedPlayer = approvedPlayers.find(
          (p) => p.id === data.eliminatedPlayerId,
        )
        if (
          eliminatedPlayer?.role === 'hunter' &&
          data.eliminatedPlayerId === playerId
        ) {
          setHunterDeathShooting(true)
        }
        // Check if the eliminated player is a tanner (they win when voted)
        if (eliminatedPlayer?.role === 'tanner' && data.cause === 'vote') {
          toast.success('🎉 Chán đời đã thắng khi bị vote chết!')
          // Emit tanner win to server to end game immediately
          socket.emit('game:tannerWin', { roomCode })
        } else {
          // Check win condition after voting elimination (if not tanner)
          const winCondition = checkWinCondition(newApprovedPlayers)
          if (winCondition) {
            socket.emit('game:checkWinCondition', { roomCode, winner: winCondition })
          }
        }
      }
    }

    socket.on('votingResult', handleVotingResult)

    return () => {
      socket.off('votingResult', handleVotingResult)
    }
  }, [socket, approvedPlayers])

  const handleVote = async () => {
    socket.emit('voting:done', {
      roomCode,
      targetId: selectedTarget?.id,
    })

    setHasVoted(true)
    toast.success('Đã gửi phiếu bầu')
  }

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
            selectedId={selectedTarget?.id}
            onSelect={(player) => setSelectedTarget(player)}
            selectableList={approvedPlayers.filter((p) => p.alive)}
          />
        </div>

        {selectedTarget?.id && !hasVoted && (
          <div className="w-full rounded-lg bg-gray-800 p-3">
            <div className="text-gray-300">
              Bạn sẽ bỏ phiếu cho: &nbsp;
              <span className="font-semibold text-red-400">
                {selectedTarget?.username}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleVote}
          disabled={!selectedTarget?.id || hasVoted}
          variant="yellow"
          className="w-full"
        >
          {hasVoted ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" />
              <span>Đang bỏ phiếu</span>
            </div>
          ) : (
            <div>Bỏ phiếu</div>
          )}
        </Button>
      </div>
    </div>
  )
}

export default VotingPhase
