import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'

interface BodyguardActionProps {
  roomCode: string
}

const BodyguardAction: React.FC<BodyguardActionProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { nightPrompt, setNightPrompt } = useRoomStore()
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      console.log('⭐ bodyguard data', data)
      setNightPrompt(data)
    }
    socket.on('night:bodyguard-action', handler)
    return () => {
      socket.off('night:bodyguard-action', handler)
    }
  }, [socket])

  if (!nightPrompt || nightPrompt.type !== 'bodyguard') {
    return null
  }

  const handleVote = async () => {
    if (!selectedTarget) {
      toast.error('Vui lòng chọn người để bảo vệ')
      return
    }

    setPending(true)

    try {
      socket.emit('night:bodyguard-action:done', {
        roomCode,
        targetId: selectedTarget,
      })
      toast.success('Đã gửi lựa chọn')
    } catch (error) {
      toast.error('Có lỗi xảy ra')
      console.error('Bodyguard action error:', error)
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
        <h3 className="text-xl font-bold text-green-400">🛡️ Lượt Bảo vệ</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>

      {nightPrompt.lastProtected && (
        <div className="w-full rounded-lg bg-yellow-900/50 p-3">
          <p className="text-sm text-yellow-300">
            Đêm trước đã bảo vệ:{' '}
            <span className="font-semibold">{nightPrompt.lastProtected}</span>
          </p>
        </div>
      )}

      <div className="w-full space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Chọn người để bảo vệ:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {nightPrompt.candidates?.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTarget(player.id)}
              className={`rounded-lg p-3 text-sm font-medium transition-colors ${
                selectedTarget === player.id
                  ? 'bg-green-600 text-white'
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
            Bạn sẽ bảo vệ:{' '}
            <span className="font-semibold text-green-400">
              {targetPlayer?.username}
            </span>
          </p>
        </div>
      )}

      <button
        onClick={handleVote}
        disabled={!selectedTarget || pending}
        className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? 'Đang gửi...' : 'Xác nhận'}
      </button>
    </div>
  )
}

export default BodyguardAction
