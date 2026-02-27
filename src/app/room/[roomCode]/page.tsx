'use client'
import React, { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'
import { NightResult, useRoomStore } from '@/hook/useRoomStore'
import { Player } from '@/types/player'
import NightPhase from '@/components/phase/NightPhase'
import DayPhase from '@/components/phase/DayPhase'
import PhaseTransition from '@/components/PhaseTransition'
import VotingPhase from '@/components/phase/VotingPhase'
import GameEnd from '@/components/GameEnd'
import WinnerReveal from '@/components/WinnerReveal'
import Waiting from '@/components/phase/Waiting'
import HunterDeathShoot from '@/components/actions/HunterDeathShoot'
import { TimerProvider } from '@/hook/useTimerContext'
import { playSound, triggerHaptic, initAudio } from '@/lib/audio'
import { useRouter } from 'next/navigation'
import type { GameLogEntry } from '@/types/game-log'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const { roomCode } = React.use(params)

  const [nightResult, setNightResult] = useState<NightResult | null>(null)
  const [gameWinner, setGameWinner] = useState<
    'villagers' | 'werewolves' | 'tanner' | null
  >(null)
  const [showReveal, setShowReveal] = useState(false)
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])

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

  // Refs to avoid stale closures in socket listeners
  const approvedPlayersRef = useRef(approvedPlayers)
  const playerIdRef = useRef(playerId)
  const roleRef = useRef(role)
  const gameWinnerRef = useRef<'villagers' | 'werewolves' | 'tanner' | null>(
    null,
  )
  useEffect(() => {
    approvedPlayersRef.current = approvedPlayers
  }, [approvedPlayers])
  useEffect(() => {
    playerIdRef.current = playerId
  }, [playerId])
  useEffect(() => {
    roleRef.current = role
  }, [role])

  useEffect(() => {
    // Reconnect: re-register with server using persistent ID
    const handleReconnect = () => {
      socket.emit('rq_player:rejoinRoom', { roomCode, persistentPlayerId })
    }
    socket.on('connect', handleReconnect)

    // Ensure audio constraints are initialized
    initAudio()

    socket.on('game:phaseChanged', (newPhase: { phase: string }) => {
      setPhase(
        newPhase.phase as 'night' | 'day' | 'voting' | 'conclude' | 'ended',
      )
      setNightPrompt(null)

      if (newPhase.phase === 'night') {
        playSound('night_start')
      } else if (newPhase.phase === 'day') {
        playSound('day_start')
      }
    })

    socket.on(
      'game:nightResult',
      ({ diedPlayerIds, cause, deaths }: NightResult) => {
        setNightResult({ diedPlayerIds, cause, deaths })

        const newApprovedPlayers: Player[] = approvedPlayersRef.current.map(
          (player) =>
            diedPlayerIds.includes(player.id)
              ? { ...player, alive: false }
              : player,
        )

        if (diedPlayerIds.includes(playerIdRef.current)) {
          setAlive(false)
          playSound('player_die')
          triggerHaptic([200, 100, 200, 100, 500]) // Heavy death vibration
          // Hunter death shoot is triggered by game:hunterShoot, not here
        } else if (diedPlayerIds.length > 0) {
          // Someone else died
          playSound('player_die')
          triggerHaptic(50) // Small bump
        }

        setApprovedPlayers(newApprovedPlayers)
      },
    )

    socket.on('game:hunterShoot', ({ hunterId }: { hunterId: string }) => {
      if (hunterId === playerIdRef.current && roleRef.current === 'hunter') {
        setHunterDeathShooting(true)
      } else {
        toast.info('Thợ săn đã bắn!')
      }
    })

    socket.on(
      'votingResult',
      (data: {
        eliminatedPlayerId: string | null
        cause: 'vote' | 'hunter' | 'tie' | 'no_votes'
        tiedPlayerIds?: string[]
      }) => {
        // Skip player updates if game already ended — game:gameEnded has authoritative data
        if (gameWinnerRef.current) return

        // Tie or no votes — no one is eliminated
        if (!data.eliminatedPlayerId) {
          toast.info(
            data.cause === 'tie'
              ? 'Hòa phiếu! Không ai bị loại.'
              : 'Không ai bỏ phiếu. Không ai bị loại.',
          )
          return
        }

        const newApprovedPlayers = approvedPlayersRef.current.map((player) =>
          player.id === data.eliminatedPlayerId
            ? { ...player, alive: false }
            : player,
        )
        setApprovedPlayers(newApprovedPlayers)

        if (data.eliminatedPlayerId === playerIdRef.current) {
          setAlive(false)
          // Check if the eliminated player is a hunter
          const eliminatedPlayer = approvedPlayersRef.current.find(
            (p) => p.id === data.eliminatedPlayerId,
          )
          if (
            eliminatedPlayer?.role === 'hunter' &&
            data.eliminatedPlayerId === playerIdRef.current
          ) {
            setHunterDeathShooting(true)
          }
        }
      },
    )

    socket.on(
      'game:gameEnded',
      ({
        winner,
        players,
        gameLog: logData,
      }: {
        winner: 'villagers' | 'werewolves' | 'tanner'
        players?: Player[]
        gameLog?: GameLogEntry[]
      }) => {
        // Set game-ended ref synchronously to guard against concurrent votingResult handler
        gameWinnerRef.current = winner
        // Update approvedPlayers with final player states
        if (players) {
          setApprovedPlayers(players)
          approvedPlayersRef.current = players
          // Update own alive status from final game state
          const me = players.find((p) => p.id === playerIdRef.current)
          if (me && !me.alive) {
            setAlive(false)
          }
        }
        if (logData) {
          setGameLog(logData)
        }
        setGameWinner(winner)
        setShowReveal(true)
      },
    )

    return () => {
      socket.off('connect', handleReconnect)
      socket.off('game:phaseChanged')
      socket.off('game:nightResult')
      socket.off('game:hunterShoot')
      socket.off('votingResult')
      socket.off('game:gameEnded')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistentPlayerId, roomCode])

  const renderPhase = () => {
    if (hunterDeathShooting && role === 'hunter') {
      return <HunterDeathShoot roomCode={roomCode} />
    }

    // Game end screens should render for ALL players (alive or dead)
    if (gameWinner && showReveal) {
      return (
        <WinnerReveal
          winner={gameWinner}
          onComplete={() => setShowReveal(false)}
        />
      )
    }

    // After reveal, show the final game end screen
    if (gameWinner && !showReveal) {
      return (
        <GameEnd
          winningTeam={gameWinner}
          players={approvedPlayers}
          currentPlayerId={playerId}
          gameLog={gameLog}
          onReturn={() => router.push('/')}
          onPlayAgain={() => router.push(`/join-room`)}
        />
      )
    }

    // Dead players can still see day results and conclude, but not act during night/voting
    if (!alive) {
      if (phase === 'day' || phase === 'conclude') {
        return <DayPhase nightResult={nightResult} />
      }
      // Stay on Waiting screen regardless of phase changes
      return <Waiting />
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
        return <Waiting />
    }
  }

  return (
    <TimerProvider>
      {/* <PhaseTransition phase={phase}>{renderPhase()}</PhaseTransition> */}
      {renderPhase()}
    </TimerProvider>
  )
}

export default RoomPage
