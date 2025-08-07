import React, { useState } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'
import { PlayerGrid } from '../PlayerGrid'
import { Button } from '../ui/button'

interface HunterDeathShootProps {
  roomCode: string
}

const HunterDeathShoot: React.FC<HunterDeathShootProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { approvedPlayers, setHunterDeathShooting } = useRoomStore()
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
  }>()
  const [sending, setSending] = useState(false)

  const alivePlayers = approvedPlayers.filter((p) => p.alive)

  const handleShoot = async () => {
    if (!selectedTarget) return

    setSending(true)
    socket.emit('game:hunterShoot:done', {
      roomCode,
      targetId: selectedTarget.id,
    })
    toast.success('Đã bắn mục tiêu')
    setHunterDeathShooting(false)
  }

  const handleSkip = async () => {
    setSending(true)
    socket.emit('game:hunterShoot:done', {
      roomCode,
      targetId: undefined,
    })
    toast.success('Đã bỏ qua lượt bắn')
    setHunterDeathShooting(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-orange-400">
          🏹 Thợ săn bắn cuối
        </h3>
        <p className="text-sm text-gray-300">
          Bạn đã chết! Chọn một người để bắn trước khi rời khỏi cuộc chơi
        </p>
      </div>
      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
          selectedId={selectedTarget?.id}
          onSelect={setSelectedTarget}
          selectableList={alivePlayers}
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
          onClick={handleSkip}
          disabled={sending}
          variant="default"
          className="w-1/3"
        >
          Bỏ qua
        </Button>
        <Button
          onClick={handleShoot}
          disabled={!selectedTarget?.id || sending}
          variant="yellow"
          className="w-2/3"
        >
          {sending ? 'Đang gửi...' : 'Bắn'}
        </Button>
      </div>
    </div>
  )
}

export default HunterDeathShoot
