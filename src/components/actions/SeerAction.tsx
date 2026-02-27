import React, { useState, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { useTimer } from '@/hook/useTimerContext'
import { toast } from 'sonner'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'
import Waiting from '../phase/Waiting'
import CountdownTimer from '../CountdownTimer'

const SeerAction: React.FC<{
  roomCode: string
}> = ({ roomCode }) => {
  const socket = getSocket()

  const { nightPrompt, setNightPrompt, approvedPlayers, playerId } =
    useRoomStore()

  const timer = useTimer()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  } | null>(null)

  const [seerResult, setSeerResult] = useState<boolean | null>(null)
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)

  useEffect(() => {
    sendingRef.current = sending
  }, [sending])

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      setNightPrompt(data)
    }
    socket.on('night:seer-action', handler)
    return () => {
      socket.off('night:seer-action', handler)
    }
  }, [])

  // Use ref to track selected target for result listener, avoiding re-subscription
  const selectedTargetRef = useRef(selectedTarget)
  useEffect(() => {
    selectedTargetRef.current = selectedTarget
  }, [selectedTarget])

  useEffect(() => {
    const handler = ({
      targetId,
      isWerewolf,
    }: {
      targetId: string
      isWerewolf: boolean
    }) => {
      if (selectedTargetRef.current?.id === targetId) {
        setSeerResult(isWerewolf)
      }
    }
    socket.on('night:seer-result', handler)
    return () => {
      socket.off('night:seer-result', handler)
    }
  }, []) // Empty deps - only subscribe once

  // Auto-submit when timer expires (server handles actual timeout with default response,
  // we just update UI to disable controls)
  useEffect(() => {
    if (
      timer.isExpired &&
      !sendingRef.current &&
      nightPrompt?.type === 'seer'
    ) {
      setSending(true)
    }
  }, [timer.isExpired, nightPrompt])

  if (!nightPrompt || nightPrompt.type !== 'seer') {
    return <Waiting />
  }

  const handleVote = () => {
    if (!selectedTarget) return
    socket.emit('night:seer-action:done', {
      roomCode,
      targetId: selectedTarget.id,
    })
    toast.success('Đã gửi lựa chọn')
    setSending(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-400">🔮 Lượt Tiên tri</h3>
          <p className="text-sm text-gray-300">{nightPrompt.message}</p>
        </div>
        {timer.isActive && timer.timerContext === 'seer' && (
          <CountdownTimer countdown={timer} />
        )}
      </div>
      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
          currentPlayerId={playerId}
          selectedId={selectedTarget?.id}
          onSelect={(player) => setSelectedTarget(player)}
          selectableList={nightPrompt.candidates}
        />
      </div>
      {selectedTarget?.id && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <div className="text-gray-300">
            {seerResult === null ? (
              <div>
                Bạn sẽ xem:&nbsp;
                <span className="font-bold text-blue-400">
                  {selectedTarget.username}
                </span>
              </div>
            ) : (
              <div>
                Người chơi&nbsp;
                {selectedTarget.username}:&nbsp;
                {seerResult ? (
                  <span className="font-bold text-red-500">LÀ SÓI</span>
                ) : (
                  <span className="font-bold text-green-500">
                    KHÔNG PHẢI SÓI
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <Button
        onClick={handleVote}
        disabled={!selectedTarget?.id || sending}
        variant="yellow"
      >
        Xác nhận
      </Button>
    </div>
  )
}

export default SeerAction
