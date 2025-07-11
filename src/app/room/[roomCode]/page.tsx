'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { getSocket } from '@/lib/socket'
import {
  getStateRoomStore,
  NightResult,
  useRoomStore,
} from '@/hook/useRoomStore'
import { Player } from '@/types/player'
import { PlayerGrid } from '@/components/PlayerGrid'
import NightPhase from '@/components/phase/NightPhase'
import DayPhase from '@/components/phase/DayPhase'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()

  const { roomCode } = React.use(params)

  const [nightResult, setNightResult] = useState<NightResult | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(
    undefined,
  )
  const playerId = useRoomStore((s) => s.playerId)
  const role = useRoomStore((s) => s.role)

  const phase = useRoomStore((s) => s.phase)
  const setPhase = useRoomStore((s) => s.setPhase)

  const approvedPlayers = useRoomStore((s) => s.approvedPlayers)
  const setApprovedPlayers = useRoomStore((s) => s.setApprovedPlayers)

  console.log('⭐ store', getStateRoomStore())

  useEffect(() => {
    socket.on('game:phaseChanged', (newPhase: { phase: string }) => {
      setPhase(newPhase.phase as 'night' | 'day' | 'voting' | 'ended')
    })

    socket.on('game:nightResult', ({ diedPlayerIds, cause }: NightResult) => {
      console.log('⭐ game:nightResult', diedPlayerIds, cause)
      setNightResult({ diedPlayerIds, cause })

      const diedPlayers: Player[] = []
      let newApprovedPlayers = [...approvedPlayers]

      diedPlayerIds.forEach((p) => {
        const foundPlayer = approvedPlayers.find((player) => player.id === p)
        if (foundPlayer) {
          diedPlayers.push(foundPlayer)
        }
        newApprovedPlayers = approvedPlayers.filter(
          (player) => player.id !== p && player.alive,
        )
      })

      console.log('⭐ diedPlayers', diedPlayers)
      console.log('⭐ newApprovedPlayers', newApprovedPlayers)

      setApprovedPlayers(newApprovedPlayers)
    })

    return () => {
      socket.off('game:phaseChanged')
      socket.off('game:nightResult')
    }
  }, [])

  const handleSelectPlayer = (id: string) => {
    console.log('⭐ handleSelectPlayer', id)
    setSelectedPlayerId(id)
  }

  const renderPhase = () => {
    switch (phase) {
      case 'night':
        return <NightPhase roomCode={roomCode} />
      case 'day':
        return <DayPhase nightResult={nightResult} />
      // case 'voting':
      //   return <VotingPhase roomCode={roomCode} />
      // case 'ended':
      //   return <EndedPhase roomCode={roomCode} />
      default:
        return <div>null</div>
    }
  }

  const currentPlayer = approvedPlayers.find((p) => p.id === playerId)

  const isAllowSelectPlayer = useMemo(() => {
    return currentPlayer?.alive
  }, [currentPlayer])

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold">
          Phase:
          <span className="ml-4 tracking-widest text-yellow-400">
            {phase.toUpperCase()}
          </span>
        </h1>
      </div>

      <div className="mb-4 w-full max-w-sm">
        <div className="mb-12 text-center">
          <h2 className="h-6 font-semibold">
            {currentPlayer?.alive ? `Your role: ${role}` : 'You are dead'}
          </h2>
        </div>
        <PlayerGrid
          players={approvedPlayers}
          currentPlayerId={playerId}
          mode="room"
          selectedId={selectedPlayerId}
          onSelect={handleSelectPlayer}
          allowSelect={isAllowSelectPlayer}
        />
      </div>

      {currentPlayer?.alive && <div className="w-full">{renderPhase()}</div>}

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
  )
}

export default RoomPage
