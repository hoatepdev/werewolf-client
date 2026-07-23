'use client'
import React, { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'
import {
  NightPrompt,
  NightResult,
  PlayerVotingState,
  VotingProgress,
  VotingResultSummary,
  useRoomStore,
} from '@/hook/useRoomStore'
import { Player } from '@/types/player'
import NightPhase from '@/components/phase/NightPhase'
import DayPhase from '@/components/phase/DayPhase'
import VotingPhase from '@/components/phase/VotingPhase'
import VotingResultPhase from '@/components/phase/VotingResultPhase'
import GameEnd from '@/components/GameEnd'
import WinnerReveal from '@/components/WinnerReveal'
import Waiting from '@/components/phase/Waiting'
import HunterDeathShoot from '@/components/actions/HunterDeathShoot'
import { TimerProvider } from '@/hook/useTimerContext'
import { playSound, triggerHaptic, initAudio } from '@/lib/audio'
import { useRouter } from 'next/navigation'
import { confirmDialog } from '@/components/ui/alert-dialog'
import type { GameLogEntry } from '@/types/game-log'
import { FCMNotification } from '@/components/FCMNotification'
import { PlayerGameHudContainer } from '@/components/game-hud'
import GameHistoryLog from '@/components/GameHistoryLog'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const { roomCode } = React.use(params)

  const [nightResult, setNightResult] = useState<NightResult | null>(null)
  type PlayerStateSnapshot = {
    phase?: 'night' | 'day' | 'voting' | 'conclude' | 'ended' | null
    playerId?: string
    role?: Player['role']
    alive?: boolean | null
    players?: Player[]
    nightPrompt?: NightPrompt | null
    hunterDeathShooting?: boolean
    voting?: {
      progress?: VotingProgress | null
      state?: PlayerVotingState | null
      result?: VotingResultSummary | null
    }
    winner?: 'villagers' | 'werewolves' | 'tanner'
    gameLog?: GameLogEntry[]
    loverPartner?: { id: string; username: string } | null
  }

  const [gameWinner, setGameWinner] = useState<
    'villagers' | 'werewolves' | 'tanner' | null
  >(null)
  const [showReveal, setShowReveal] = useState(false)
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])

  const {
    playerId,
    setPlayerId,
    persistentPlayerId,
    reconnectToken,
    rehydrated,
    phase,
    setPhase,
    setRole,
    approvedPlayers,
    setApprovedPlayers,
    setAlive,
    setNightPrompt,
    alive,
    role,
    hunterDeathShooting,
    setHunterDeathShooting,
    setVotingProgress,
    votingResult,
    setVotingResult,
    setPlayerVotingState,
    setLoverPartner,
    clearSavedSession,
    clearGameRuntimeState,
    clearPlayerRoomSession,
  } = useRoomStore()

  // Refs to avoid stale closures in socket listeners
  const approvedPlayersRef = useRef(approvedPlayers)
  const playerIdRef = useRef(playerId)
  const roleRef = useRef(role)
  const lastVotingResultKeyRef = useRef<string | null>(null)
  const reconnectFailedRef = useRef(false)
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
    if (!rehydrated) return

    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined

    const handleReconnectFailure = (message?: string) => {
      if (reconnectFailedRef.current) return
      reconnectFailedRef.current = true
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      toast.error(
        message ||
          'Không thể tiếp tục ván. Ván có thể đã kết thúc, phòng đã hết hạn hoặc phiên trên thiết bị này không còn hợp lệ.',
      )
      clearSavedSession()
      router.replace('/')
    }

    // Reconnect: re-register with server using persistent ID
    const handleReconnect = () => {
      if (!persistentPlayerId || !reconnectToken) {
        handleReconnectFailure('Không tìm thấy phiên ván cũ.')
        return
      }

      socket.emit('rq_player:rejoinRoom', {
        roomCode,
        persistentPlayerId,
        reconnectToken,
      })

      reconnectTimeout = setTimeout(() => {
        handleReconnectFailure()
      }, 5000)
    }
    const handlePlayerRejoined = (data: {
      role?: Player['role']
      phase?: 'night' | 'day' | 'voting' | 'conclude' | 'ended' | null
      players?: Player[]
      alive?: boolean | null
    }) => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (data.role) setRole(data.role)
      if (data.phase) setPhase(data.phase)
      if (data.players) {
        const approved = data.players.filter(
          (player) => player.status === 'approved',
        )
        setApprovedPlayers(approved)
        approvedPlayersRef.current = approved
      }
      if (typeof data.alive === 'boolean') setAlive(data.alive)
    }

    const syncGameLogFromPayload = (payload: { gameLog?: GameLogEntry[] }) => {
      if (Array.isArray(payload.gameLog)) {
        setGameLog(payload.gameLog)
      }
    }

    const applyPlayerSnapshot = (snapshot: PlayerStateSnapshot) => {
      if (snapshot.playerId) setPlayerId(snapshot.playerId)
      if (snapshot.role) setRole(snapshot.role)
      if (snapshot.phase) setPhase(snapshot.phase)
      if (typeof snapshot.alive === 'boolean' || snapshot.alive === null) {
        setAlive(snapshot.alive)
      }
      if (snapshot.players) {
        const approved = snapshot.players.filter(
          (player) => player.status === 'approved',
        )
        setApprovedPlayers(approved)
        approvedPlayersRef.current = approved
      }

      setNightPrompt(snapshot.nightPrompt ?? null)
      setLoverPartner(snapshot.loverPartner ?? null)
      setHunterDeathShooting(snapshot.hunterDeathShooting === true)
      setVotingProgress(snapshot.voting?.progress ?? null)
      setPlayerVotingState(snapshot.voting?.state ?? null)
      syncGameLogFromPayload(snapshot)
      if (snapshot.voting?.result) {
        setVotingResult(snapshot.voting.result)
      } else if (snapshot.phase === 'night' || snapshot.phase === 'voting') {
        setVotingResult(null)
        lastVotingResultKeyRef.current = null
      }
      if (snapshot.winner) {
        gameWinnerRef.current = snapshot.winner
        setGameWinner(snapshot.winner)
        setShowReveal(false)
        setVotingProgress(null)
        setPlayerVotingState(null)
      }
    }

    const requestStateSync = () => {
      if (!persistentPlayerId || !reconnectToken) return
      socket.emit('rq_player:syncState', {
        roomCode,
        persistentPlayerId,
        reconnectToken,
      })
    }

    let lastSyncAt = 0
    const requestStateSyncThrottled = () => {
      const now = Date.now()
      if (now - lastSyncAt < 2000) return
      lastSyncAt = now
      requestStateSync()
    }

    const handleVisibilitySync = () => {
      if (document.visibilityState === 'visible') requestStateSyncThrottled()
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'WEREWOLF_NOTIFICATION_CLICK') {
        requestStateSyncThrottled()
      }
    }

    const handlePlayerRejoinError = (data: { message?: string }) => {
      handleReconnectFailure(data.message)
    }

    socket.on('connect', handleReconnect)
    socket.on('player:rejoined', handlePlayerRejoined)
    socket.on('player:rejoinRoomError', handlePlayerRejoinError)
    socket.on('player:stateSnapshot', applyPlayerSnapshot)
    document.addEventListener('visibilitychange', handleVisibilitySync)
    window.addEventListener('focus', requestStateSyncThrottled)
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)

    if (socket.connected) {
      handleReconnect()
    } else {
      socket.connect()
    }

    // Ensure audio constraints are initialized
    initAudio()

    socket.on('night:action-timeout', () => {
      setNightPrompt(null)
    })

    socket.on(
      'night:cupid-linked',
      (partner: { partnerId: string; partnerName: string }) => {
        setLoverPartner({ id: partner.partnerId, username: partner.partnerName })
        toast.success(`Bạn đã được ghép đôi với ${partner.partnerName}.`)
      },
    )

    socket.on('game:phaseChanged', (newPhase: { phase: string }) => {
      setPhase(
        newPhase.phase as 'night' | 'day' | 'voting' | 'conclude' | 'ended',
      )
      setNightPrompt(null)
      if (newPhase.phase !== 'voting') {
        setVotingProgress(null)
        setPlayerVotingState(null)
      }
      if (newPhase.phase === 'voting') {
        setPlayerVotingState(null)
      }
      if (newPhase.phase === 'night' || newPhase.phase === 'voting') {
        setVotingResult(null)
        lastVotingResultKeyRef.current = null
      }

      if (newPhase.phase === 'night') {
        playSound('night_start')
      } else if (newPhase.phase === 'day') {
        playSound('day_start')
      }
    })

    socket.on(
      'game:nightResult',
      (payload: NightResult) => {
        const { diedPlayerIds, cause, deaths } = payload
        syncGameLogFromPayload(payload)
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
          if (
            deaths?.some(
              (death) =>
                death.playerId === playerIdRef.current && death.cause === 'lover',
            )
          ) {
            toast.error('Người yêu của bạn đã chết. Bạn cũng chết theo.')
          }
          // Hunter death shoot is triggered by game:hunterShoot, not here
        } else if (diedPlayerIds.length > 0) {
          // Someone else died
          playSound('player_die')
          triggerHaptic(50) // Small bump
        }

        approvedPlayersRef.current = newApprovedPlayers
        setApprovedPlayers(newApprovedPlayers)
      },
    )

    socket.on('voting:progress', setVotingProgress)
    socket.on('voting:state', (state: PlayerVotingState) => {
      setPlayerVotingState(state)
    })

    socket.on('game:hunterShoot', ({ hunterId }: { hunterId: string }) => {
      if (hunterId === playerIdRef.current && roleRef.current === 'hunter') {
        setHunterDeathShooting(true)
      }
      // No toast here — game:hunterShot (past tense) is emitted after the actual shot
    })

    socket.on(
      'game:hunterShot',
      ({
        hunterId,
        targetId,
        additionalDeaths,
        gameLog,
      }: {
        hunterId: string
        targetId: string | null
        additionalDeaths?: Array<{
          playerId: string
          playerName: string
          cause: 'lover'
        }>
        gameLog?: GameLogEntry[]
      }) => {
        syncGameLogFromPayload({ gameLog })
        const target = targetId
          ? approvedPlayersRef.current.find((p) => p.id === targetId)
          : undefined
        const diedPlayerIds = [
          ...(targetId ? [targetId] : []),
          ...(additionalDeaths?.map((death) => death.playerId) ?? []),
        ]
        const updatedPlayers = approvedPlayersRef.current.map((player) =>
          diedPlayerIds.includes(player.id) ? { ...player, alive: false } : player,
        )
        approvedPlayersRef.current = updatedPlayers
        setApprovedPlayers(updatedPlayers)
        if (diedPlayerIds.includes(playerIdRef.current)) {
          setAlive(false)
        }
        if (hunterId !== playerIdRef.current) {
          toast.info(
            target
              ? `Thợ săn đã bắn ${target.username}!`
              : 'Thợ săn đã bỏ qua lượt bắn.',
          )
        }
        if (additionalDeaths?.some((death) => death.playerId === playerIdRef.current)) {
          toast.error('Người yêu của bạn đã chết. Bạn cũng chết theo.')
        }
        setHunterDeathShooting(false)
      },
    )

    const handleVotingResult = (data: VotingResultSummary) => {
      syncGameLogFromPayload(data)
      // Skip player updates if game already ended — game:gameEnded has authoritative data
      if (gameWinnerRef.current) return

      const resultKey = `${data.round}:${data.cause}:${data.eliminatedPlayerId ?? 'none'}:${data.votedCount}`
      if (lastVotingResultKeyRef.current === resultKey) return
      lastVotingResultKeyRef.current = resultKey

      setVotingProgress(null)
      setVotingResult(data)

      // Tie or no votes — no one is eliminated
      if (!data.eliminatedPlayerId) {
        toast.info(
          data.cause === 'tie'
            ? 'Hòa phiếu! Không ai bị loại.'
            : 'Không ai bỏ phiếu. Không ai bị loại.',
        )
        return
      }

      const diedPlayerIds = [
        data.eliminatedPlayerId,
        ...(data.additionalDeaths?.map((death) => death.playerId) ?? []),
      ]
      const newApprovedPlayers = approvedPlayersRef.current.map((player) =>
        diedPlayerIds.includes(player.id) ? { ...player, alive: false } : player,
      )
      approvedPlayersRef.current = newApprovedPlayers
      setApprovedPlayers(newApprovedPlayers)

      if (diedPlayerIds.includes(playerIdRef.current)) {
        setAlive(false)
        playSound('player_die')
        triggerHaptic([200, 100, 200, 100, 500])
        if (
          data.additionalDeaths?.some(
            (death) => death.playerId === playerIdRef.current,
          )
        ) {
          toast.error('Người yêu của bạn đã chết. Bạn cũng chết theo.')
        }
      } else {
        playSound('player_die')
        triggerHaptic(50)
      }
    }

    socket.on('voting:result', handleVotingResult)
    socket.on('votingResult', handleVotingResult)

    const handleGameEnded = ({
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
      syncGameLogFromPayload({ gameLog: logData })
      setVotingProgress(null)
      setVotingResult(null)
      setPlayerVotingState(null)
      setGameWinner(winner)
      setShowReveal(true)
    }

    const handleRoomReset = () => {
      clearGameRuntimeState()
      setNightResult(null)
      setGameWinner(null)
      gameWinnerRef.current = null
      setShowReveal(false)
      setGameLog([])
      lastVotingResultKeyRef.current = null
      toast.success('Phòng đã được reset. Quay lại sảnh chờ.')
      router.replace(`/lobby/${roomCode}`)
    }

    const handlePlayerLeft = (data: {
      playerId: string
      username: string
      activeGame: boolean
    }) => {
      if (data.playerId === playerIdRef.current) return
      if (data.activeGame) {
        const updatedPlayers = approvedPlayersRef.current.map((player) =>
          player.id === data.playerId ? { ...player, alive: false } : player,
        )
        approvedPlayersRef.current = updatedPlayers
        setApprovedPlayers(updatedPlayers)
      } else {
        const updatedPlayers = approvedPlayersRef.current.filter(
          (player) => player.id !== data.playerId,
        )
        approvedPlayersRef.current = updatedPlayers
        setApprovedPlayers(updatedPlayers)
      }
      toast.info(`${data.username} đã rời phòng`)
    }

    socket.on('game:gameEnded', handleGameEnded)
    socket.on('room:reset', handleRoomReset)
    socket.on('room:playerLeft', handlePlayerLeft)

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      socket.off('connect', handleReconnect)
      socket.off('player:rejoined', handlePlayerRejoined)
      socket.off('player:rejoinRoomError', handlePlayerRejoinError)
      socket.off('player:stateSnapshot', applyPlayerSnapshot)
      document.removeEventListener('visibilitychange', handleVisibilitySync)
      window.removeEventListener('focus', requestStateSyncThrottled)
      navigator.serviceWorker?.removeEventListener(
        'message',
        handleServiceWorkerMessage,
      )
      socket.off('night:action-timeout')
      socket.off('night:cupid-linked')
      socket.off('game:phaseChanged')
      socket.off('game:nightResult')
      socket.off('voting:progress')
      socket.off('voting:state')
      socket.off('game:hunterShoot')
      socket.off('game:hunterShot')
      socket.off('voting:result', handleVotingResult)
      socket.off('votingResult', handleVotingResult)
      socket.off('game:gameEnded', handleGameEnded)
      socket.off('room:reset', handleRoomReset)
      socket.off('room:playerLeft', handlePlayerLeft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistentPlayerId, reconnectToken, rehydrated, roomCode, setVotingResult])

  const handleLeaveActiveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Rời ván',
      description:
        'Bạn sẽ rời ván hiện tại và không thể kết nối lại bằng phiên này. Bạn có chắc chắn không?',
      confirmText: 'Rời ván',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    socket.emit(
      'rq_player:leaveRoom',
      { roomCode },
      (ack?: { success: boolean; message?: string }) => {
        if (!ack?.success) {
          toast.error(ack?.message || 'Không thể rời ván')
          return
        }
        clearPlayerRoomSession()
        toast.success(ack.message || 'Bạn đã rời ván')
        router.replace('/')
      },
    )
  }

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
          onReturn={() => {
            clearSavedSession()
            router.push('/')
          }}
          onPlayAgain={() => {
            toast.info('Chờ quản trò reset phòng để chơi lại cùng mã phòng.')
            router.push(`/lobby/${roomCode}`)
          }}
        />
      )
    }

    // Dead players can still see public day/conclude results, but not act during night/voting
    if (!alive) {
      if (phase === 'conclude') {
        return <VotingResultPhase result={votingResult} />
      }
      if (phase === 'day') {
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
        return <VotingResultPhase result={votingResult} />
      default:
        return <Waiting />
    }
  }

  return (
    <TimerProvider>
      <div className="min-h-screen">
        {!gameWinner && (
          <div className="fixed top-4 right-4 left-4 z-40 mx-auto max-w-5xl">
            <PlayerGameHudContainer
              roomCode={roomCode}
              onLeave={handleLeaveActiveRoom}
            />
          </div>
        )}
        {!gameWinner && (
          <div className="fixed top-52 right-4 z-40 w-72 max-w-[calc(100vw-2rem)] lg:top-36">
            <FCMNotification roomCode={roomCode} participantKind="player" />
          </div>
        )}
        <div className={!gameWinner ? 'pt-56 lg:pt-40' : undefined}>
          {renderPhase()}
          {!gameWinner && (
            <div className="mx-auto mt-6 w-full max-w-sm px-4 pb-8">
              <GameHistoryLog
                gameLog={gameLog}
                title="Lịch sử ván"
                compact
                showEmptyState
              />
            </div>
          )}
        </div>
      </div>
    </TimerProvider>
  )
}

export default RoomPage
