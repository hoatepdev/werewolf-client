'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import { PlayerGrid } from '@/components/PlayerGrid'
import { MockDataPanel } from '@/components/MockDataPanel'
import { Player } from '@/types/player'
import { CornerUpLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AVATAR_OPTIONS } from '@/lib/mockAvatar'
import { confirmDialog } from '@/components/ui/alert-dialog'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const router = useRouter()
  const isGM = useRoomStore((s) => s.isGm)
  const [showMockPanel, setShowMockPanel] = useState(false)

  const { roomCode } = React.use(params)

  const phase = useRoomStore((s) => s.phase)
  const setPhase = useRoomStore((s) => s.setPhase)
  const role = useRoomStore((s) => s.role)
  const setRole = useRoomStore((s) => s.setRole)
  const alive = useRoomStore((s) => s.alive)
  const setAlive = useRoomStore((s) => s.setAlive)
  const playerId = useRoomStore((s) => s.playerId)
  const approvedPlayers = useRoomStore((s) => s.approvedPlayers)
  const setApprovedPlayers = useRoomStore((s) => s.setApprovedPlayers)
  const username = useRoomStore((s) => s.username)
  const avatarKey = useRoomStore((s) => s.avatarKey)

  console.log('⭐ playerId', playerId)

  console.log('⭐ approvedPlayers', approvedPlayers)

  useEffect(() => {
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    // socket.emit("room:join", { roomCode, playerId, isGM });

    socket.on('room:phase', (newPhase: string) => {
      setPhase(newPhase as import('@/hook/useRoomStore').Phase)
    })
    socket.on('room:role', (newRole: string) => {
      setRole(newRole)
    })
    socket.on('room:alive', (isAlive: boolean) => {
      setAlive(isAlive)
    })
    socket.on('room:getPlayers', (data: Player[]) => {
      console.log('⭐ room:getPlayers', data)
      const approvedPlayers = data.filter(
        (player) => player.status === 'approved',
      )
      setApprovedPlayers(approvedPlayers)
    })
    socket.on('room:updatePlayers', (data: Player[]) => {
      console.log('⭐ room:updatePlayers', data)
      const approvedPlayers = data.filter(
        (player) => player.status === 'approved',
      )
      setApprovedPlayers(approvedPlayers)
    })

    // socket.emit("room:getPlayers", { roomCode });

    return () => {
      socket.off('room:phase')
      socket.off('room:role')
      socket.off('room:alive')
      socket.off('room:getPlayers')
      socket.off('room:updatePlayers')
    }
  }, [
    roomCode,
    playerId,
    isGM,
    setPhase,
    setRole,
    setAlive,
    setApprovedPlayers,
  ])

  const handleNextPhase = () => {
    const socket = getSocket()
    socket.emit('rq_gm:nextPhase', { roomCode })
  }

  const getWaitingMessage = () => {
    if (isGM) {
      return 'Waiting for players to join...'
    }
    return 'Waiting for GM to start the game...'
  }

  const toggleMockDataPanel = () => setShowMockPanel(!showMockPanel)

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Leave Room',
      description: 'Are you sure you want to leave the room?',
      confirmText: 'Leave',
      cancelText: 'Cancel',
    })
    if (!confirmed) return
    // const socket = getSocket();
    // socket.emit("room:leave", { roomCode });
    router.push('/')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
            aria-label="Back"
            onClick={handleLeaveRoom}
          >
            <CornerUpLeft className="h-6 w-6 text-gray-400" />
          </button>
          <h1 className="text-xl font-bold">{roomCode}</h1>
        </div>
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          {isGM ? (
            <button
              className="text-zinc-400 transition-colors hover:text-yellow-400"
              onClick={toggleMockDataPanel}
              title="Toggle Mock Data Panel"
            >
              <Settings className="h-5 w-5" />
            </button>
          ) : username ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[80px] truncate text-sm font-semibold text-yellow-300">
                {username}
              </span>
              <span className="text-2xl">{AVATAR_OPTIONS[avatarKey]}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <div className="mb-6 w-full max-w-sm">
          <div className="mb-4 flex items-center justify-center gap-2 text-center">
            <div className="text-sm text-zinc-400">Phase</div>
            <div className="rounded-md border border-yellow-400 bg-yellow-400 px-2 py-1 text-xl font-semibold text-black">
              {phase}
            </div>
          </div>

          {phase === 'waiting' && (
            <div className="mb-6 text-center">
              <div className="text-lg text-zinc-400">{getWaitingMessage()}</div>
            </div>
          )}
        </div>

        <div className="mb-6 w-full max-w-sm">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold">
              Players ({approvedPlayers.length}/9)
            </h2>
          </div>
          <PlayerGrid players={approvedPlayers} currentPlayerId={playerId} />
        </div>

        {isGM ? (
          <div className="w-full max-w-sm">
            <div className="mb-4 text-center">
              <div className="font-bold text-blue-400">Game Master View</div>
            </div>
            <button
              className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-black transition-colors hover:bg-yellow-300"
              onClick={handleNextPhase}
            >
              Next Phase
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="mb-4 text-center">
              <div className="font-bold text-green-400">Player View</div>
            </div>
            <div className="rounded-xl bg-zinc-800 p-4 text-center">
              <div className="mb-2">
                Role:{' '}
                <span className="font-semibold text-yellow-400">
                  {role || '?'}
                </span>
              </div>
              <div>
                Status:{' '}
                <span className={alive ? 'text-green-400' : 'text-red-400'}>
                  {alive ? 'Alive' : 'Dead'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <MockDataPanel
        isVisible={showMockPanel}
        toggleMockDataPanel={toggleMockDataPanel}
      />
    </main>
  )
}

export default RoomPage
