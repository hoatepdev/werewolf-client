import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useRoomStore } from '@/hook/useRoomStore'
import type { GameLogEntry } from '@/types/game-log'
import type { Player, GameStats } from '@/types/player'
import type {
  AudioEvent,
  GmCommandAck,
  GmLogEntry,
  NightActionData,
  VotingProgress,
} from './types'

type GmPlayerCommandAck = GmCommandAck & {
  playerId?: string
  players?: Player[]
}

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
  gameLog?: GameLogEntry[]
  gmActionLog?: GmActionLogSnapshotEntry[]
  winner?: 'villagers' | 'werewolves' | 'tanner'
}

type GmGameLogPayload = {
  gameLog?: GameLogEntry[]
}

export function useSocketConnection(
  roomCode: string,
  socket: Socket,
  addToQueue: (audioEvent: AudioEvent) => void,
  setCurrentAudio: (audioEvent: AudioEvent | null) => void,
  forceRender: boolean,
  onReconnectFailed?: (message?: string) => void,
  onSnapshotLogs?: (logs: GmLogEntry[]) => void,
  onGameLogSync?: (gameLog: GameLogEntry[]) => void,
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
  const [gmCommandError, setGmCommandError] = useState<string | null>(null)
  const [pendingGmCommand, setPendingGmCommand] = useState<string | null>(null)
  const [votingProgress, setVotingProgress] = useState<VotingProgress | null>(
    null,
  )

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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateGameStats = useCallback((playerList: Player[]) => {
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
  }, [])

  const applyPlayerList = useCallback(
    (playerList: Player[]) => {
      const approvedPlayers = playerList.filter(
        (player) => player.status === 'approved',
      )
      setPlayers(approvedPlayers)
      updateGameStats(approvedPlayers)
    },
    [updateGameStats],
  )

  const setCommandError = useCallback((message?: string) => {
    const normalized = message || 'Không thể thực hiện lệnh GM.'
    setGmCommandError(normalized)
    toast.error(normalized)
  }, [])

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

    const clearReconnectTimeout = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    const connectGmRoom = () => {
      if (!gmPersistentId || !gmReconnectToken) {
        const message = 'Không tìm thấy phiên quản trò đã lưu.'
        toast.error(message)
        onReconnectFailed?.(message)
        return
      }

      clearReconnectTimeout()
      socket.emit('rq_gm:connectGmRoom', {
        roomCode,
        gmRoomId: `gm:${roomCode}:${socket.id}`,
        gmPersistentId,
        gmReconnectToken,
      })
      reconnectTimeoutRef.current = setTimeout(() => {
        const message = 'Không thể khôi phục phiên quản trò.'
        setIsConnected(false)
        toast.error(message)
        onReconnectFailed?.(message)
      }, 5000)
    }

    socket.on('connect', connectGmRoom)

    if (!socket.connected) {
      socket.connect()
    } else {
      connectGmRoom()
    }

    const applyGmSnapshot = (snapshot: GmStateSnapshot) => {
      if (snapshot.phase) {
        setPhase(snapshot.phase)
        if (snapshot.phase !== 'voting') setVotingProgress(null)
      }
      if (snapshot.players) {
        applyPlayerList(snapshot.players)
      }
      if (snapshot.winner) {
        setWinner(snapshot.winner)
      }
      if (Array.isArray(snapshot.gameLog)) {
        onGameLogSync?.(snapshot.gameLog)
      }
      if (snapshot.gmActionLog) {
        const logTypeBySnapshotType: Record<
          GmActionLogSnapshotEntry['type'],
          string
        > = {
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
        clearReconnectTimeout()
        setIsConnected(true)
        setGmCommandError(null)
        toast.success('GM đã kết nối thành công')
        requestGmStateSync()
      },
      'gm:connectRoomError': (data: { message?: string }) => {
        clearReconnectTimeout()
        setIsConnected(false)
        const message =
          data.message && data.message !== 'Không có quyền truy cập.'
            ? data.message
            : 'Không thể tiếp tục phòng quản trò. Phòng có thể đã hết hạn hoặc phiên không còn hợp lệ.'
        toast.error(message)
        onReconnectFailed?.(message)
      },
      disconnect: () => {
        clearReconnectTimeout()
        setIsConnected(false)
        toast.warning('Mất kết nối quản trò. Đang thử kết nối lại...')
      },
      connect_error: () => {
        setIsConnected(false)
        toast.warning('Chưa kết nối được máy chủ. Đang thử lại...')
      },
      'gm:stateSnapshot': applyGmSnapshot,
      'gm:stateSnapshotError': (data: { message?: string }) => {
        setCommandError(data.message || 'Không thể đồng bộ trạng thái GM.')
      },
      'game:phaseChanged': (data: {
        phase: 'night' | 'day' | 'voting' | 'conclude' | 'ended'
      }) => {
        setPhase(data.phase)
        if (data.phase !== 'voting') setVotingProgress(null)
      },
      'room:updatePlayers': (players: Player[]) => {
        applyPlayerList(players)
      },
      'room:updatePlayersError': (data: { message?: string }) => {
        setCommandError(
          data.message || 'Không thể làm mới danh sách người chơi.',
        )
      },
      'room:phaseError': (data: { message?: string }) => {
        setCommandError(data.message || 'Không thể chuyển giai đoạn.')
      },
      'room:resetError': (data: { message?: string }) => {
        setCommandError(data.message || 'Không thể reset phòng.')
      },
      'gm:eliminatePlayerError': (data: { message?: string }) => {
        setCommandError(data.message || 'Không thể loại bỏ người chơi.')
      },
      'gm:revivePlayerError': (data: { message?: string }) => {
        setCommandError(data.message || 'Không thể hồi sinh người chơi.')
      },
      'voting:progress': (progress: VotingProgress) => {
        setVotingProgress(progress)
      },
      'room:reset': () => {
        clearGameRuntimeState()
        setPhase('night')
        setWinner(null)
        setNightActions([])
        setVotingProgress(null)
        onGameLogSync?.([])
        setCurrentAudio(null)
        toast.success('Phòng đã được reset')
      },
      'gm:nightAction': (nightAction: NightActionData) => {
        if (Array.isArray(nightAction.gameLog)) {
          onGameLogSync?.(nightAction.gameLog)
        }
        setNightActions((prev) => [...prev, nightAction])
        // Don't add timeout messages to audio queue - they reveal role info
        if (nightAction.action !== 'timeout') {
          addToQueue({
            type: 'nightAction',
            message: nightAction.message,
          })
        }
      },
      'gm:votingAction': (
        data: { type: 'votingAction'; message: string } & GmGameLogPayload,
      ) => {
        if (Array.isArray(data.gameLog)) {
          onGameLogSync?.(data.gameLog)
        }
        addToQueue({
          type: data.type,
          message: data.message,
        })
      },
      'gm:hunterAction': (
        data: {
          type: 'hunterDied' | 'hunterShot' | 'hunterSkipped'
          message: string
        } & GmGameLogPayload,
      ) => {
        if (Array.isArray(data.gameLog)) {
          onGameLogSync?.(data.gameLog)
        }
        addToQueue({
          type: 'hunterAction',
          message: data.message,
        })
      },
      'gm:gameEnded': (data: {
        type: 'gameEnded'
        message: string
        winner: 'villagers' | 'werewolves' | 'tanner'
      } & GmGameLogPayload) => {
        setPhase('ended')
        setWinner(data.winner)
        setVotingProgress(null)
        if (Array.isArray(data.gameLog)) {
          onGameLogSync?.(data.gameLog)
        }
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
    navigator.serviceWorker?.addEventListener(
      'message',
      handleServiceWorkerMessage,
    )

    return () => {
      clearReconnectTimeout()
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
    onGameLogSync,
    applyPlayerList,
    setCommandError,
  ])

  const handleNextPhase = useCallback(() => {
    setGmCommandError(null)
    socket.emit('rq_gm:nextPhase', { roomCode })
  }, [roomCode, socket])

  const handleDayTimerControl = useCallback(
    (
      action: 'start' | 'extend' | 'skip',
      payload: { durationMs?: number; deltaMs?: number } = {},
    ) => {
      setGmCommandError(null)
      setPendingGmCommand(`day-timer:${action}`)

      return new Promise<boolean>((resolve) => {
        socket.emit(
          'rq_gm:dayTimerControl',
          { roomCode, action, ...payload },
          (ack?: GmCommandAck) => {
            setPendingGmCommand(null)
            if (!ack?.success) {
              setCommandError(ack?.message || 'Không thể điều khiển timer ngày.')
              resolve(false)
              return
            }
            toast.success(ack.message || 'Đã cập nhật timer thảo luận')
            resolve(true)
          },
        )
      })
    },
    [roomCode, setCommandError, socket],
  )

  const handleStartDayTimer = useCallback(
    (durationMs?: number) => handleDayTimerControl('start', { durationMs }),
    [handleDayTimerControl],
  )

  const handleExtendDayTimer = useCallback(
    (deltaMs: number) => handleDayTimerControl('extend', { deltaMs }),
    [handleDayTimerControl],
  )

  const handleSkipDayTimer = useCallback(
    () => handleDayTimerControl('skip'),
    [handleDayTimerControl],
  )

  const handleEliminatePlayer = useCallback(
    (player: Player, reason: string) => {
      setGmCommandError(null)
      setPendingGmCommand(`eliminate:${player.id}`)
      return new Promise<boolean>((resolve) => {
        socket.emit(
          'rq_gm:eliminatePlayer',
          {
            roomCode,
            playerId: player.id,
            reason,
          },
          (ack?: GmPlayerCommandAck) => {
            setPendingGmCommand(null)
            if (!ack?.success) {
              setCommandError(ack?.message || 'Không thể loại bỏ người chơi.')
              resolve(false)
              return
            }
            if (ack.players) applyPlayerList(ack.players)
            toast.success(
              ack.message || `Đã loại bỏ người chơi: ${player.username}`,
            )
            resolve(true)
          },
        )
      })
    },
    [applyPlayerList, roomCode, setCommandError, socket],
  )

  const handleRevivePlayer = useCallback(
    (playerId: string) => {
      setGmCommandError(null)
      setPendingGmCommand(`revive:${playerId}`)
      return new Promise<boolean>((resolve) => {
        socket.emit(
          'rq_gm:revivePlayer',
          { roomCode, playerId },
          (ack?: GmPlayerCommandAck) => {
            setPendingGmCommand(null)
            if (!ack?.success) {
              setCommandError(ack?.message || 'Không thể hồi sinh người chơi.')
              resolve(false)
              return
            }
            if (ack.players) applyPlayerList(ack.players)
            toast.success(ack.message || 'Đã hồi sinh người chơi')
            resolve(true)
          },
        )
      })
    },
    [applyPlayerList, roomCode, setCommandError, socket],
  )

  const handleGetPlayers = useCallback(() => {
    setGmCommandError(null)
    socket.emit('rq_gm:getPlayers', { roomCode })
  }, [roomCode, socket])

  const handleResetRoom = useCallback(
    (options?: { force?: boolean; onSuccess?: () => void }) => {
      setGmCommandError(null)
      setPendingGmCommand('reset')
      socket.emit(
        'rq_gm:resetRoom',
        { roomCode, force: options?.force },
        (ack?: GmCommandAck) => {
          setPendingGmCommand(null)
          if (!ack?.success) {
            setCommandError(ack?.message || 'Không thể reset phòng')
            return
          }
          clearGameRuntimeState()
          setPhase('night')
          setWinner(null)
          setNightActions([])
          setVotingProgress(null)
          onGameLogSync?.([])
          setCurrentAudio(null)
          toast.success(ack.message || 'Đã reset phòng')
          options?.onSuccess?.()
        },
      )
    },
    [
      clearGameRuntimeState,
      roomCode,
      onGameLogSync,
      setCommandError,
      setCurrentAudio,
      setPhase,
      socket,
    ],
  )

  const handleSetMockPlayers = useCallback(
    (list: Player[]) => {
      applyPlayerList(list)
    },
    [applyPlayerList],
  )

  return {
    isConnected,
    phase,
    players,
    gameStats,
    nightActions,
    winner,
    gmCommandError,
    pendingGmCommand,
    votingProgress,
    clearGmCommandError: () => setGmCommandError(null),
    handleNextPhase,
    handleStartDayTimer,
    handleExtendDayTimer,
    handleSkipDayTimer,
    handleEliminatePlayer,
    handleRevivePlayer,
    handleGetPlayers,
    handleResetRoom,
    handleSetMockPlayers,
    setCurrentAudio,
  }
}
