import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'

interface HunterActionProps {
  roomCode: string
}

const HunterAction: React.FC<HunterActionProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { nightPrompt, setNightPrompt } = useRoomStore()
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      console.log('⭐ hunter data', data)
      setNightPrompt(data)
    }
    socket.on('night:hunter-action', handler)
    return () => {
      socket.off('night:hunter-action', handler)
    }
  }, [socket])

  if (!nightPrompt || nightPrompt.type !== 'hunter') {
    return null
  }

  const handleVote = async () => {
    setPending(true)

    try {
      socket.emit('night:hunter-action:done', {
        roomCode,
        targetId: selectedTarget,
      })
      toast.success('Đã gửi lựa chọn')
    } catch (error) {
      toast.error('Có lỗi xảy ra')
      console.error('Hunter action error:', error)
    } finally {
      setPending(false)
    }
  }

  const targetPlayer = nightPrompt.candidates?.find(
    (p) => p.id === selectedTarget,
  )

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-gray-900 p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-orange-400">🏹 Lượt Thợ săn</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>

      <div className="w-full space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Chọn người để bắn (tùy chọn):
        </label>
        <div className="grid grid-cols-2 gap-2">
          {nightPrompt.candidates?.map((player) => (
            <button
              key={player.id}
              onClick={() =>
                setSelectedTarget(
                  selectedTarget === player.id ? null : player.id,
                )
              }
              className={`rounded-lg p-3 text-sm font-medium transition-colors ${
                selectedTarget === player.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {player.username}
            </button>
          ))}
        </div>
      </div>

      {selectedTarget && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <p className="text-sm text-gray-300">
            Bạn sẽ bắn:{' '}
            <span className="font-semibold text-orange-400">
              {targetPlayer?.username}
            </span>
          </p>
        </div>
      )}

      <button
        onClick={handleVote}
        disabled={pending}
        className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? 'Đang gửi...' : 'Xác nhận'}
      </button>
    </div>
  )
}

export default HunterAction
