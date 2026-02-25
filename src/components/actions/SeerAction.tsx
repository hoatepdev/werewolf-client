import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'
import Waiting from '../phase/Waiting'

const SeerAction: React.FC<{
  roomCode: string
}> = ({ roomCode }) => {
  const socket = getSocket()

  const { nightPrompt, setNightPrompt, approvedPlayers } = useRoomStore()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  } | null>(null)

  const [seerResult, setSeerResult] = useState<boolean | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      setNightPrompt(data)
    }
    socket.on('night:seer-action', handler)
    return () => {
      socket.off('night:seer-action', handler)
    }
  }, [])

  useEffect(() => {
    const handler = ({
      targetId,
      isWerewolf,
    }: {
      targetId: string
      isWerewolf: boolean
    }) => {
      if (selectedTarget?.id === targetId) {
        setSeerResult(isWerewolf)
      }
    }
    socket.on('night:seer-result', handler)
    return () => {
      socket.off('night:seer-result', handler)
    }
  }, [selectedTarget])

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
      <div className="text-center">
        <h3 className="text-xl font-bold text-blue-400">🔮 Lượt Tiên tri</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>
      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
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
