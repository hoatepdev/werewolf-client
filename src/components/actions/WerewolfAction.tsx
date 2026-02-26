import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import {
  getStateRoomStore,
  NightPrompt,
  useRoomStore,
} from '@/hook/useRoomStore'
import { toast } from 'sonner'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'
import Waiting from '../phase/Waiting'

interface WerewolfActionProps {
  roomCode: string
}

const WerewolfAction: React.FC<WerewolfActionProps> = ({ roomCode }) => {
  const socket = getSocket()

  const { nightPrompt, setNightPrompt, approvedPlayers, playerId } = useRoomStore()

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  }>()
  const [sending, setSending] = useState(false)
  console.log('⭐ nightPrompt', nightPrompt)

  console.log('⭐ store', getStateRoomStore(), sending)

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      console.log('⭐ data', data)
      setNightPrompt(data)
    }
    socket.on('night:werewolf-action', handler)
    return () => {
      socket.off('night:werewolf-action', handler)
    }
  }, [])

  const handleVote = async () => {
    if (!selectedTarget) {
      toast.error('Vui lòng chọn người để cắn')
      return
    }

    setSending(true)

    socket.emit('night:werewolf-action:done', {
      roomCode,
      targetId: selectedTarget.id,
    })
    toast.success('Đã gửi vote')
  }

  if (!nightPrompt || nightPrompt.type !== 'werewolf' || sending) {
    return <Waiting />
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-yellow-400">🐺 Lượt Sói</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>
      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
          currentPlayerId={playerId}
          selectedId={selectedTarget?.id}
          onSelect={(player) => setSelectedTarget(player ?? undefined)}
          selectableList={nightPrompt.candidates}
        />
      </div>

      {selectedTarget?.id && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <div className="text-gray-300">
            Bạn sẽ cắn: &nbsp;
            <span className="font-semibold text-red-400">
              {selectedTarget?.username}
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={handleVote}
        disabled={!selectedTarget?.id}
        variant="yellow"
      >
        Xác nhận
      </Button>
    </div>
  )
}

export default WerewolfAction
