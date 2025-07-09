'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { getStateRoomStore, useRoomStore } from '@/hook/useRoomStore'
import { Player } from '@/types/player'
import { CornerUpLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { confirmDialog } from '@/components/ui/alert-dialog'
import { PlayerGrid } from '@/components/PlayerGrid'
import { Button } from '@/components/ui/button'
import NightPhaseNew from '@/components/phase/NightPhase'
import NightPhase from '@/components/phase/NightPhase'
import DayPhase from '@/components/phase/DayPhase'
import VotingPhase from '@/components/VotingPhase'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
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
  const [nightResult, setNightResult] = useState<{
    diedPlayerIds: string[]
    cause: string
  } | null>(null)
  console.log('⭐ store', getStateRoomStore())

  const alivePlayers = approvedPlayers
    .filter((p) => p.alive)
    .map((p) => ({ id: p.id, name: p.username }))

  useEffect(() => {
    socket.on('game:phaseChanged', (newPhase: { phase: string }) => {
      setPhase(newPhase.phase as 'night' | 'day' | 'voting' | 'ended')
    })

    socket.on('room:updatePlayers', (data: Player[]) => {
      const approved = data.filter((player) => player.status === 'approved')
      setApprovedPlayers(approved)
    })

    socket.on(
      'game:nightResult',
      (data: { diedPlayerIds: string[]; cause: string }) => {
        setNightResult(data)
      },
    )

    return () => {
      socket.off('game:phaseChanged')
      socket.off('room:updatePlayers')
      socket.off('game:nightResult')
    }
  }, [roomCode, playerId, setPhase, setRole, setAlive, setApprovedPlayers])

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Leave Room',
      description: 'Are you sure you want to leave the room?',
      confirmText: 'Leave',
      cancelText: 'Cancel',
    })
    if (!confirmed) return

    router.push('/join-room')
  }

  const renderPhase = () => {
    switch (phase) {
      case 'night':
        return <NightPhase roomCode={roomCode} />
      case 'day':
        return <DayPhase nightResult={''} />
      // case 'voting':
      //   return <VotingPhase roomCode={roomCode} />
      // case 'ended':
      //   return <EndedPhase roomCode={roomCode} />
      default:
        return <div>12312312312</div>
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex h-10 items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
            aria-label="Back"
            onClick={handleLeaveRoom}
          >
            <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
          </button>
          <h1 className="text-xl font-bold">{roomCode}</h1>
        </div>
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          <button
            className="text-zinc-400 transition-colors hover:text-yellow-400"
            onClick={() => setShowMockPanel(!showMockPanel)}
            title="Toggle Mock Data Panel"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">
            Phase:
            <span className="ml-4 tracking-widest text-yellow-400">
              {phase.toUpperCase()}
            </span>
          </h1>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-12 text-center">
            <h2 className="h-6 font-semibold">
              {alive ? `Your role: ${role}` : 'You are dead'}
            </h2>
          </div>
          <PlayerGrid
            players={approvedPlayers}
            currentPlayerId={playerId}
            mode="room"
          />
        </div>

        <div className="w-full">{renderPhase()}</div>

        {nightResult && (
          <div className="text-center text-zinc-300">
            {nightResult.cause}
            {nightResult.diedPlayerIds.map((id) => {
              const player = approvedPlayers.find((p) => p.id === id)
              return <div key={id}>{player?.username}</div>
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default RoomPage
