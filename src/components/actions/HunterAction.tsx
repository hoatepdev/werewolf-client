import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'
import Waiting from '../phase/Waiting'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'

interface HunterActionProps {
  roomCode: string
}

const HunterAction: React.FC<HunterActionProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { nightPrompt, setNightPrompt, approvedPlayers } = useRoomStore()
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  }>()
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      console.log('⭐ hunter data', data)
      setNightPrompt(data)
    }
    socket.on('night:hunter-action', handler)
    return () => {
      socket.off('night:hunter-action', handler)
    }
  }, [])

  if (!nightPrompt || nightPrompt.type !== 'hunter' || sending) {
    return <Waiting />
  }

  const handleVote = async (isSkip: boolean = false) => {
    setSending(true)

    socket.emit('night:hunter-action:done', {
      roomCode,
      targetId: isSkip ? undefined : selectedTarget?.id,
    })
    toast.success('Đã gửi lựa chọn')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-orange-400">🏹 Lượt Thợ săn</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>
      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
          selectedId={selectedTarget?.id}
          onSelect={setSelectedTarget}
          selectableList={nightPrompt.candidates}
        />
      </div>
      {selectedTarget?.id && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <p className="text-sm text-gray-300">
            Bạn sẽ bắn:{' '}
            <span className="font-semibold text-orange-400">
              {selectedTarget?.username}
            </span>
          </p>
        </div>
      )}
      <div className="flex w-full gap-2">
        <Button
          onClick={() => handleVote(true)}
          disabled={sending}
          variant="default"
          className="w-1/3"
        >
          Bỏ qua
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={sending}
          variant="yellow"
          className="w-2/3"
        >
          {sending ? 'Đang gửi...' : 'Xác nhận'}
        </Button>
      </div>
    </div>
  )
}

export default HunterAction
