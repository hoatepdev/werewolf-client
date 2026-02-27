import React, { useState, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import { useTimer } from '@/hook/useTimerContext'
import { toast } from 'sonner'
import PhaseTransitionImage from '../PhaseTransitionImage'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import CountdownTimer from '../CountdownTimer'

const VotingPhase: React.FC = () => {
  const socket = getSocket()
  const { playerId, approvedPlayers, roomCode } = useRoomStore()

  const timer = useTimer()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  } | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const hasVotedRef = useRef(false)

  // Update ref when hasVoted changes
  useEffect(() => {
    hasVotedRef.current = hasVoted
  }, [hasVoted])

  // Auto-submit when timer expires (client-side auto-submit with abstain vote)
  useEffect(() => {
    if (timer.isExpired && !hasVotedRef.current && timer.timerContext === 'voting') {
      socket.emit('voting:done', { roomCode, targetId: null })
      setHasVoted(true)
      hasVotedRef.current = true
      toast.info('Hết thời gian! Tự động bỏ phiếu trắng.')
    }
  }, [timer.isExpired, timer.timerContext, roomCode, socket])

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
      {/* <PhaseTransitionImage
        image="/images/phase/voting.jpg"
        bgColor="#2E3A62"
      /> */}

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-yellow-400">
              👥 Giai đoạn bỏ phiếu
            </h3>
            <p className="text-sm text-gray-300">
              Mời mọi người bỏ phiếu cho người mà bạn cho là người chết trong đêm
            </p>
          </div>
          {timer.isActive && <CountdownTimer countdown={timer} />}
        </div>

        <div className="w-full">
          <PlayerGrid
            players={approvedPlayers}
            mode="room"
            currentPlayerId={playerId}
            selectedId={selectedTarget?.id}
            onSelect={(player) => setSelectedTarget(player)}
            selectableList={approvedPlayers.filter((p) => p.alive)}
            disabled={hasVoted}
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
