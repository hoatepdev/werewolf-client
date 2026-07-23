import React, { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { NightPrompt, useRoomStore } from '@/hook/useRoomStore'
import { useTimer } from '@/hook/useTimerContext'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Player } from '@/types/player'
import { PlayerGrid } from '../PlayerGrid'
import Waiting from '../phase/Waiting'
import CountdownTimer from '../CountdownTimer'

interface CupidActionProps {
  roomCode: string
}

const CupidAction: React.FC<CupidActionProps> = ({ roomCode }) => {
  const socket = getSocket()
  const { nightPrompt, setNightPrompt, approvedPlayers, playerId } =
    useRoomStore()
  const timer = useTimer()

  const [selectedTargets, setSelectedTargets] = useState<Player[]>([])
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)

  useEffect(() => {
    sendingRef.current = sending
  }, [sending])

  useEffect(() => {
    const handler = (data: NightPrompt) => {
      setNightPrompt(data)
      setSelectedTargets([])
      setSending(false)
    }
    socket.on('night:cupid-action', handler)
    return () => {
      socket.off('night:cupid-action', handler)
    }
  }, [setNightPrompt, socket])

  useEffect(() => {
    if (timer.isExpired && !sendingRef.current && nightPrompt?.type === 'cupid') {
      setSending(true)
    }
  }, [timer.isExpired, nightPrompt])

  if (!nightPrompt || nightPrompt.type !== 'cupid' || sending) {
    return <Waiting />
  }

  const handleSelect = (player: Player | null) => {
    if (!player) return

    setSelectedTargets((current) => {
      if (current.some((target) => target.id === player.id)) {
        return current.filter((target) => target.id !== player.id)
      }
      if (current.length >= 2) {
        return [current[1], player]
      }
      return [...current, player]
    })
  }

  const handleSubmit = () => {
    if (selectedTargets.length !== 2) {
      toast.error('Vui lòng chọn đúng hai người để ghép đôi')
      return
    }

    socket.emit('night:cupid-action:done', {
      roomCode,
      targetIds: selectedTargets.map((target) => target.id),
    })
    setSending(true)
    toast.success('Đã ghép đôi hai người chơi')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-pink-400">💘 Lượt Thần tình yêu</h3>
          <p className="text-sm text-gray-300">{nightPrompt.message}</p>
        </div>
        {timer.isActive && timer.timerContext === 'cupid' && (
          <CountdownTimer countdown={timer} />
        )}
      </div>

      <div className="w-full">
        <PlayerGrid
          players={approvedPlayers}
          mode="room"
          currentPlayerId={playerId}
          selectedIds={selectedTargets.map((target) => target.id)}
          onSelect={handleSelect}
          selectableList={nightPrompt.candidates}
        />
      </div>

      <div className="w-full rounded-lg bg-pink-950/30 p-3 text-sm text-gray-300">
        {selectedTargets.length > 0 ? (
          <>
            Bạn đã chọn:{' '}
            <span className="font-semibold text-pink-300">
              {selectedTargets.map((target) => target.username).join(' và ')}
            </span>
          </>
        ) : (
          'Chọn hai người để ghép đôi trong đêm đầu tiên.'
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selectedTargets.length !== 2}
        variant="yellow"
      >
        Ghép đôi
      </Button>
    </div>
  )
}

export default CupidAction
