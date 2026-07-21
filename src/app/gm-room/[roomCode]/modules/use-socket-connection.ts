import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useRoomStore } from '@/hook/useRoomStore'
import type { Player, GameStats } from '@/types/player'
import type { AudioEvent, GmLogEntry, NightActionData } from './types'

type GmActionLogSnapshotEntry = {
  type: 'nightAction' | 'votingAction' | 'hunterAction' | 'gameEnded'
  message: string
  timestamp: number
  step?: string
  action?: string
  winner?: 'villagers' | 'werewolves' | 'tanner'
}

type GmStateSnapshot = {
  phase?: 'night' | 'day' | 'voting' | 'conclude' | 'ended' | null
  players?: Player[]
  gmActionLog?: GmActionLogSnapshotEntry[]
  winner?: 'villagers' | 'werewolves' | 'tanner'
}

export function useSocketConnection(
  roomCode: string,
  socket: Socket,
  addToQueue: (audioEvent: AudioEvent) => void,
  setCurrentAudio: (audioEvent: AudioEvent | null) => void,
  forceRender: boolean,
  onReconnectFailed?: (message?: string) => void,
  onSnapshotLogs?: (logs: GmLogEntry[]) => void,
) {
  const [isConnected, setIsConnected] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 0,
    alivePlayers: 0,
    deadPlayers: 0,
    werewolves: 0,
    villagers: 0,
  })

  const {
    phase,
    setPhase,
    gmPersistentId,
    gmReconnectToken,
    clearGameRuntimeState,
  } = useRoomStore()

  const [nightActions, setNightActions] = useState<NightActionData[]>([])
  const [winner, setWinner] = useState<
    'villagers' | 'werewolves' | 'tanner' | null
  >(null)

  useEffect(() => {
    const requestGmStateSync = () => {
      if (!gmPersistentId || !gmReconnectToken) return
      socket.emit('rq_gm:syncState', {
        roomCode,
        gmPersistentId,
        gmReconnectToken,
      })
    }

    let lastSyncAt = 0
    const requestGmStateSyncThrottled = () => {
      const now = Date.now()
      if (now - lastSyncAt < 2000) return
      lastSyncAt = now
      requestGmStateSync()
    }

    const handleVisibilitySync = () => {
      if (document.visibilityState === 'visible') requestGmStateSyncThrottled()
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'WEREWOLF_NOTIFICATION_CLICK') {
        requestGmStateSyncThrottled()
      }
    }

    const connectGmRoom = () => {
      if (!gmPersistentId || !gmReconnectToken) {
        const message = 'Không tìm thấy phiên quản trò đã lưu.'
        toast.error(message)
        onReconnectFailed?.(message)
        return
      }

      socket.emit('rq_gm:connectGmRoom', {
        roomCode,
        gmRoomId: `gm:${roomCode}:${socket.id}`,
        gmPersistentId,
        gmReconnectToken,
      })
    }

    if (!socket.connected) {
      socket.connect()
      socket.once('connect', connectGmRoom)
    } else {
      connectGmRoom()
    }

    const applyGmSnapshot = (snapshot: GmStateSnapshot) => {
      if (snapshot.phase) setPhase(snapshot.phase)
      if (snapshot.players) {
        const approvedPlayers = snapshot.players.filter(
          (player) => player.status === 'approved',
        )
        setPlayers(approvedPlayers)
        updateGameStats(approvedPlayers)
      }
      if (snapshot.winner) {
        setWinner(snapshot.winner)
      }
      if (snapshot.gmActionLog) {
        const logTypeBySnapshotType: Record<GmActionLogSnapshotEntry['type'], string> = {
          nightAction: 'night',
          votingAction: 'voting',
          hunterAction: 'hunter',
          gameEnded: 'end',
        }
        const logs = snapshot.gmActionLog.map((entry) => ({
          type: logTypeBySnapshotType[entry.type],
          message: entry.message,
          data: entry,
          timestamp: entry.timestamp,
          sensitive: entry.type === 'nightAction',
        }))
        onSnapshotLogs?.(logs)
        setNightActions(
          snapshot.gmActionLog
            .filter((entry) => entry.type === 'nightAction')
            .map((entry) => ({
              step: entry.step ?? '',
              action: entry.action ?? '',
              message: entry.message,
              timestamp: entry.timestamp,
            })),
        )
      }
    }

    const handlers = {
      'gm:connected': (data: {
        roomCode: string
        gmRoomId: string
        message: string
      }) => {
        setIsConnected(true)
        toast.success('GM đã kết nối thành công')
        requestGmStateSync()
      },
      'gm:connectRoomError': (data: { message?: string }) => {
        setIsConnected(false)
        const message =
          data.message && data.message !== 'Not authorized.'
            ? data.message
            : 'Không thể tiếp tục phòng quản trò. Phòng có thể đã hết hạn hoặc phiên không còn hợp lệ.'
        toast.error(message)
        onReconnectFailed?.(message)
      },
      'gm:stateSnapshot': applyGmSnapshot,
      'game:phaseChanged': (data: {
        phase: 'night' | 'day' | 'voting' | 'ended'
      }) => {
        setPhase(data.phase)
      },
      'room:updatePlayers': (players: Player[]) => {
        const approvedPlayers = players.filter(
          (player) => player.status === 'approved',
        )
        setPlayers(approvedPlayers)
        updateGameStats(approvedPlayers)
      },
      'room:reset': () => {
        clearGameRuntimeState()
        setPhase('night')
        setWinner(null)
        setNightActions([])
        setCurrentAudio(null)
        toast.success('Phòng đã được reset')
      },
      'gm:nightAction': (nightAction: NightActionData) => {
        setNightActions((prev) => [...prev, nightAction])
        // Don't add timeout messages to audio queue - they reveal role info
        if (nightAction.action !== 'timeout') {
          addToQueue({
            type: 'nightAction',
            message: nightAction.message,
          })
        }
      },
      'gm:votingAction': (data: { type: 'votingAction'; message: string }) => {
        addToQueue({
          type: data.type,
          message: data.message,
        })
      },
      'gm:hunterAction': (data: {
        type: 'hunterDied' | 'hunterShot' | 'hunterSkipped'
        message: string
      }) => {
        addToQueue({
          type: 'hunterAction',
          message: data.message,
        })
      },
      'gm:gameEnded': (data: {
        type: 'gameEnded'
        message: string
        winner: 'villagers' | 'werewolves' | 'tanner'
      }) => {
        setPhase('ended')
        setWinner(data.winner)
        addToQueue({
          type: data.type,
          message: data.message,
        })
      },
    } as const

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler as (...args: unknown[]) => void)
    })
    document.addEventListener('visibilitychange', handleVisibilitySync)
    window.addEventListener('focus', requestGmStateSyncThrottled)
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)

    return () => {
      socket.off('connect', connectGmRoom)
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler as (...args: unknown[]) => void)
      })
      document.removeEventListener('visibilitychange', handleVisibilitySync)
      window.removeEventListener('focus', requestGmStateSyncThrottled)
      navigator.serviceWorker?.removeEventListener(
        'message',
        handleServiceWorkerMessage,
      )
    }
  }, [
    roomCode,
    socket,
    setPhase,
    setCurrentAudio,
    clearGameRuntimeState,
    addToQueue,
    forceRender,
    gmPersistentId,
    gmReconnectToken,
    onReconnectFailed,
    onSnapshotLogs,
  ])

  const updateGameStats = (playerList: Player[]) => {
    const alivePlayers = playerList.filter((p) => p.alive)
    const deadPlayers = playerList.filter((p) => !p.alive)
    const werewolves = alivePlayers.filter((p) => p.role === 'werewolf')
    const villagers = alivePlayers.filter(
      (p) => p.role !== 'werewolf' && p.role !== 'tanner',
    )

    setGameStats({
      totalPlayers: playerList.length,
      alivePlayers: alivePlayers.length,
      deadPlayers: deadPlayers.length,
      werewolves: werewolves.length,
      villagers: villagers.length,
    })
  }

  const handleNextPhase = () => {
    socket.emit('rq_gm:nextPhase', { roomCode })
  }

  const handleEliminatePlayer = (player: Player, reason: string) => {
    socket.emit('rq_gm:eliminatePlayer', {
      roomCode,
      playerId: player.id,
      reason,
    })
    toast.success(`Đã loại bỏ người chơi: ${player.username}`)
  }

  const handleRevivePlayer = (playerId: string) => {
    socket.emit('rq_gm:revivePlayer', { roomCode, playerId })
    toast.success('Đã hồi sinh người chơi')
  }

  const handleGetPlayers = () => {
    socket.emit('rq_gm:getPlayers', { roomCode })
  }

  const handleResetRoom = (onSuccess?: () => void) => {
    socket.emit(
      'rq_gm:resetRoom',
      { roomCode },
      (ack?: { success: boolean; message?: string }) => {
        if (!ack?.success) {
          toast.error(ack?.message || 'Không thể reset phòng')
          return
        }
        clearGameRuntimeState()
        setPhase('night')
        setWinner(null)
        setNightActions([])
        setCurrentAudio(null)
        toast.success(ack.message || 'Đã reset phòng')
        onSuccess?.()
      },
    )
  }

  const handleSetMockPlayers = (list: Player[]) => {
    setPlayers(list)
    updateGameStats(list)
  }

  return {
    isConnected,
    phase,
    players,
    gameStats,
    nightActions,
    winner,
    handleNextPhase,
    handleEliminatePlayer,
    handleRevivePlayer,
    handleGetPlayers,
    handleResetRoom,
    handleSetMockPlayers,
    setCurrentAudio,
  }
}
