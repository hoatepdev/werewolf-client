'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import {
  getStateRoomStore,
  NightResult,
  useRoomStore,
} from '@/hook/useRoomStore'
import { Player } from '@/types/player'
import NightPhase from '@/components/phase/NightPhase'
import DayPhase from '@/components/phase/DayPhase'
import PhaseTransition from '@/components/PhaseTransition'
import VotingPhase from '@/components/phase/VotingPhase'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()

  const { roomCode } = React.use(params)

  const [nightResult, setNightResult] = useState<NightResult | null>(null)

  const { phase, setPhase, approvedPlayers, setApprovedPlayers } =
    useRoomStore()

  console.log('⭐ store', getStateRoomStore())

  useEffect(() => {
    socket.on('game:phaseChanged', (newPhase: { phase: string }) => {
      setPhase(newPhase.phase as 'night' | 'day' | 'voting' | 'ended')
    })

    socket.on('game:nightResult', ({ diedPlayerIds, cause }: NightResult) => {
      console.log('⭐ game:nightResult', diedPlayerIds, cause)
      setNightResult({ diedPlayerIds, cause })

      const newApprovedPlayers: Player[] = [...approvedPlayers]

      diedPlayerIds.forEach((p) => {
        const foundPlayerIndex = approvedPlayers.findIndex(
          (player) => player.id === p,
        )
        if (foundPlayerIndex !== -1) {
          newApprovedPlayers[foundPlayerIndex].alive = false
        }
      })
      console.log('⭐ newApprovedPlayers', newApprovedPlayers)

      setApprovedPlayers(newApprovedPlayers)
    })

    return () => {
      socket.off('game:phaseChanged')
      socket.off('game:nightResult')
    }
  }, [])

  const renderPhase = () => {
    switch (phase) {
      case 'night':
        return <NightPhase roomCode={roomCode} />
      case 'day':
        return <DayPhase nightResult={nightResult} />
      case 'voting':
        return <VotingPhase />
      // case 'ended':
      //   return <EndedPhase roomCode={roomCode} />
      default:
        return <div>null</div>
    }
  }

  return <PhaseTransition phase={phase}>{renderPhase()}</PhaseTransition>
}

export default RoomPage
