'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'
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
import GameEnd from '@/components/GameEnd'
import Waiting from '@/components/phase/Waiting'
import HunterDeathShoot from '@/components/actions/HunterDeathShoot'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()

  const { roomCode } = React.use(params)

  const [nightResult, setNightResult] = useState<NightResult | null>(null)
  const [gameWinner, setGameWinner] = useState<string | null>(null)

  const {
    playerId,
    persistentPlayerId,
    phase,
    setPhase,
    approvedPlayers,
    setApprovedPlayers,
    setAlive,
    setNightPrompt,
    alive,
    role,
    hunterDeathShooting,
    setHunterDeathShooting,
  } = useRoomStore()

  console.log('⭐ store', getStateRoomStore())

  useEffect(() => {
    // Reconnect: re-register with server using persistent ID
    const handleReconnect = () => {
      socket.emit('rq_player:rejoinRoom', { roomCode, persistentPlayerId })
    }
    socket.on('connect', handleReconnect)

    socket.on('game:phaseChanged', (newPhase: { phase: string }) => {
      setPhase(newPhase.phase as 'night' | 'day' | 'voting' | 'conclude' | 'ended')
      setNightPrompt(null)
    })

    socket.on('game:nightResult', ({ diedPlayerIds, cause, deaths }: NightResult) => {
      setNightResult({ diedPlayerIds, cause, deaths })

      const newApprovedPlayers: Player[] = approvedPlayers.map((player) =>
        diedPlayerIds.includes(player.id) ? { ...player, alive: false } : player,
      )

      if (diedPlayerIds.includes(playerId)) {
        setAlive(false)
        // Hunter death shoot is triggered by game:hunterShoot, not here
      }

      setApprovedPlayers(newApprovedPlayers)
    })

    socket.on('game:hunterShoot', ({ hunterId }: { hunterId: string }) => {
      if (hunterId === playerId && role === 'hunter') {
        setHunterDeathShooting(true)
      } else {
        toast.info('Thợ săn đã bắn!')
      }
    })

    socket.on(
      'game:gameEnded',
      ({ winner }: { winner: 'villagers' | 'werewolves' | 'tanner' }) => {
        if (winner === 'villagers') {
          setGameWinner('Dân làng')
        } else if (winner === 'werewolves') {
          setGameWinner('Sói')
        } else if (winner === 'tanner') {
          setGameWinner('Chán đời')
        }
      },
    )

    return () => {
      socket.off('connect', handleReconnect)
      socket.off('game:phaseChanged')
      socket.off('game:nightResult')
      socket.off('game:hunterShoot')
      socket.off('game:gameEnded')
    }
  }, [approvedPlayers, playerId, persistentPlayerId, role, roomCode])

  const renderPhase = () => {
    if (hunterDeathShooting && role === 'hunter') {
      return <HunterDeathShoot roomCode={roomCode} />
    }
    if (!alive) return <Waiting />
    if (gameWinner) {
      return (
        <GameEnd
          winningTeam={gameWinner}
          players={approvedPlayers}
          onReturn={() => (window.location.href = '/')}
          onPlayAgain={() => window.location.reload()}
        />
      )
    }

    switch (phase) {
      case 'night':
        return <NightPhase roomCode={roomCode} />
      case 'day':
        return <DayPhase nightResult={nightResult} />
      case 'voting':
        return <VotingPhase />
      case 'conclude':
        return <DayPhase nightResult={nightResult} />
      default:
        return <div>null</div>
    }
  }

  return <PhaseTransition phase={phase}>{renderPhase()}</PhaseTransition>
}

export default RoomPage
