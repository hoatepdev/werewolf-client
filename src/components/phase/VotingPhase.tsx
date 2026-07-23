import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import { PlayerVotingState, VotingChoice, useRoomStore } from '@/hook/useRoomStore'
import { useTimer } from '@/hook/useTimerContext'
import { toast } from 'sonner'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import CountdownTimer from '../CountdownTimer'

type VotingSubmissionAck = {
  success: boolean
  status: 'accepted' | 'duplicate' | 'rejected'
  reason?: string
  message?: string
  votingState?: PlayerVotingState
}

const VotingPhase: React.FC = () => {
  const socket = getSocket()
  const {
    playerId,
    approvedPlayers,
    roomCode,
    votingProgress,
    playerVotingState,
    setPlayerVotingState,
  } = useRoomStore()

  const timer = useTimer()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timeoutToastShownRef = useRef(false)

  const hasResponded = playerVotingState?.hasResponded ?? false
  const controlsDisabled = hasResponded || isSubmitting || timer.isExpired

  const localTotalVoters = useMemo(
    () => approvedPlayers.filter((player) => player.alive).length,
    [approvedPlayers],
  )
  const progress = votingProgress ?? {
    votedCount: hasResponded ? 1 : 0,
    respondedCount: hasResponded ? 1 : 0,
    totalVoters: localTotalVoters,
  }
  const respondedCount = progress.respondedCount ?? progress.votedCount
  const progressPercent = progress.totalVoters
    ? Math.min(100, (respondedCount / progress.totalVoters) * 100)
    : 0

  const submitVote = useCallback(
    (target: { id: string; username: string } | null) => {
      if (hasResponded || isSubmitting || timer.isExpired) return

      const choice: VotingChoice = target ? 'target' : 'abstain'
      setIsSubmitting(true)

      socket.timeout(5000).emit(
        'voting:done',
        {
          roomCode,
          choice,
          targetId: target?.id ?? null,
        },
        (err: Error | null, ack?: VotingSubmissionAck) => {
          setIsSubmitting(false)

          if (err || !ack) {
            toast.error('Không xác nhận được phiếu bầu, vui lòng thử lại.')
            return
          }

          if (ack.votingState) {
            setPlayerVotingState(ack.votingState)
          }

          if (!ack.success) {
            toast.error(ack.message ?? 'Không thể ghi nhận phiếu bầu.')
            return
          }

          if (ack.status === 'duplicate') {
            toast.info(ack.message ?? 'Phiếu của bạn đã được ghi nhận trước đó.')
            return
          }

          toast.success(
            choice === 'target' ? 'Đã ghi nhận phiếu bầu' : 'Đã ghi nhận phiếu trắng',
          )
        },
      )
    },
    [
      hasResponded,
      isSubmitting,
      roomCode,
      setPlayerVotingState,
      socket,
      timer.isExpired,
    ],
  )

  useEffect(() => {
    if (
      timer.isExpired &&
      !hasResponded &&
      timer.timerContext === 'voting' &&
      !timeoutToastShownRef.current
    ) {
      timeoutToastShownRef.current = true
      toast.info(
        'Hết thời gian. Nếu máy chủ chưa nhận phiếu, lượt này sẽ được tính là không phản hồi.',
      )
    }
  }, [hasResponded, timer.isExpired, timer.timerContext])

  const handleVote = async () => {
    if (!selectedTarget) return
    submitVote(selectedTarget)
  }

  return (
    <div className="relative h-full w-full flex-1">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-yellow-400">
              👥 Giai đoạn bỏ phiếu
            </h3>
            <p className="text-sm text-gray-300">
              Hãy bỏ phiếu cho người bạn nghi là Sói để cả làng quyết định loại
              khỏi ván
            </p>
          </div>
          {timer.isActive && <CountdownTimer countdown={timer} />}
        </div>

        <div className="w-full rounded-lg bg-gray-900/80 p-3">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Tiến độ phản hồi</span>
            <span className="font-semibold text-yellow-300">
              {respondedCount}/{progress.totalVoters}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="w-full">
          <PlayerGrid
            players={approvedPlayers}
            mode="room"
            currentPlayerId={playerId}
            selectedId={selectedTarget?.id}
            onSelect={(player) => setSelectedTarget(player)}
            selectableList={approvedPlayers.filter((p) => p.alive)}
            disabled={controlsDisabled}
          />
        </div>

        {selectedTarget?.id && !controlsDisabled && (
          <div className="w-full rounded-lg bg-gray-800 p-3">
            <div className="text-gray-300">
              Bạn sẽ bỏ phiếu cho: &nbsp;
              <span className="font-semibold text-red-400">
                {selectedTarget?.username}
              </span>
            </div>
          </div>
        )}

        {playerVotingState?.hasResponded && (
          <div className="w-full rounded-lg border border-yellow-400/30 bg-gray-800 p-4 text-center">
            <div className="font-semibold text-yellow-300">
              {playerVotingState.choice === 'target'
                ? `Máy chủ đã ghi nhận phiếu của bạn cho: ${playerVotingState.targetName ?? 'người chơi đã chọn'}`
                : 'Máy chủ đã ghi nhận bạn bỏ phiếu trắng'}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-300">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Đang chờ người chơi khác...</span>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="w-full rounded-lg border border-blue-400/30 bg-gray-800 p-4 text-center">
            <div className="flex items-center justify-center gap-2 font-semibold text-blue-300">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Đang gửi phiếu bầu...</span>
            </div>
          </div>
        )}

        {!hasResponded && (
          <div className="flex w-full flex-col gap-3">
            <Button
              onClick={handleVote}
              disabled={!selectedTarget?.id || controlsDisabled}
              variant="yellow"
              className="w-full"
            >
              Bỏ phiếu
            </Button>
            <Button
              onClick={() => submitVote(null)}
              disabled={controlsDisabled}
              variant="default"
              className="w-full border border-zinc-600 bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Bỏ phiếu trắng
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VotingPhase
