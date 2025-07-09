import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { toast } from 'sonner'

interface SeerActionProps {
  roomCode: string
}

const SeerAction: React.FC<SeerActionProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { nightPrompt, setNightPrompt } = useRoomStore()
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string
    username: string
    isRedFlag?: boolean
  } | null>(null)
  const [selectedRedFlag, setSelectedRedFlag] = useState<boolean | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      console.log('⭐ seer data', data)
      setNightPrompt(data)
    }
    socket.on('night:seer-action', handler)
    return () => {
      socket.off('night:seer-action', handler)
    }
  }, [socket])

  if (!nightPrompt || nightPrompt.type !== 'seer') {
    return null
  }

  const handleVote = async () => {
    if (!selectedTarget) {
      toast.error('Vui lòng chọn người để xem')
      return
    }

    if (selectedRedFlag !== null) {
      return
    }

    setPending(true)
    setSelectedRedFlag(selectedTarget?.isRedFlag || false)
    socket.emit('night:seer-action:done', {
      roomCode,
      targetId: selectedTarget,
    })
    toast.success('Đã gửi lựa chọn')

    setPending(false)
  }

  console.log('⭐ targetPlayer', nightPrompt.candidates, selectedTarget)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-gray-900 p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-blue-400">🔮 Lượt Tiên tri</h3>
        <p className="text-sm text-gray-300">{nightPrompt.message}</p>
      </div>

      <div className="w-full space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Chọn người để xem:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {nightPrompt.candidates?.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTarget(player)}
              className={`rounded-lg p-3 text-sm font-medium transition-colors ${
                selectedTarget?.id === player.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              disabled={selectedRedFlag !== null}
            >
              {player.username}
            </button>
          ))}
        </div>
      </div>

      {selectedTarget && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-blue-400">
              {selectedTarget?.username}
            </span>
          </p>
        </div>
      )}

      {selectedRedFlag !== null && (
        <div className="w-full rounded-lg bg-gray-800 p-3">
          <p className="text-sm text-gray-300">
            {selectedTarget?.username}:{' '}
            {selectedRedFlag ? (
              <span className="font-bold text-red-500">LÀ SÓI</span>
            ) : (
              <span className="font-bold text-green-500">KHÔNG PHẢI SÓI</span>
            )}
          </p>
        </div>
      )}

      <button
        onClick={handleVote}
        disabled={!selectedTarget || pending}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Đang gửi...' : 'Xác nhận'}
      </button>
    </div>
  )
}

export default SeerAction
