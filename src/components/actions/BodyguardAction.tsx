import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PlayerGrid } from '../PlayerGrid'
import Waiting from '../phase/Waiting'

interface BodyguardActionProps {
  roomCode: string
}

const BodyguardAction: React.FC<BodyguardActionProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { nightPrompt, setNightPrompt, approvedPlayers, playerId } =
    useRoomStore()
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  }>()
  const [sending, setSending] = useState(false)

  // Filter out last protected player from candidates
  const availableCandidates = nightPrompt?.candidates?.filter(
    candidate => candidate.id !== nightPrompt?.lastProtected
  ) || []

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      console.log('⭐ bodyguard data', data)
      setNightPrompt(data)
    }
    socket.on('night:bodyguard-action', handler)
    return () => {
      socket.off('night:bodyguard-action', handler)
    }
  }, [])

  if (!nightPrompt || nightPrompt.type !== 'bodyguard' || sending) {
    return <Waiting />
  }

  const handleVote = async () => {
    if (!selectedTarget) {
      toast.error('Vui lòng chọn người để bảo vệ')
      return
    }

    socket.emit('night:bodyguard-action:done', {
      roomCode,
      targetId: selectedTarget.id,
    })
    setSending(true)

    toast.success('Đã gửi lựa chọn')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-green-400">🛡️ Lượt Bảo vệ</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>

      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
          selectedId={selectedTarget?.id}
          onSelect={setSelectedTarget}
          selectableList={availableCandidates}
        />
      </div>

      {nightPrompt?.lastProtected && (
        <div className="w-full rounded-lg bg-orange-900/20 p-3">
          <p className="text-sm text-orange-300">
            ⚠️ Bạn không thể bảo vệ{' '}
            <span className="font-semibold">
              {approvedPlayers.find(p => p.id === nightPrompt.lastProtected)?.username}
            </span>{' '}
            hai đêm liên tiếp
          </p>
        </div>
      )}

      {selectedTarget?.id && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <p className="text-sm text-gray-300">
            Bạn sẽ bảo vệ:{' '}
            <span className="font-semibold text-green-400">
              {selectedTarget?.username}
            </span>
          </p>
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

export default BodyguardAction
