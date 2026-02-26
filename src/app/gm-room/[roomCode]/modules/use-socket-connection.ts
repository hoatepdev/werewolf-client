import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useRoomStore } from '@/hook/useRoomStore'
import type { Player, GameStats } from '@/types/player'
import type { AudioEvent, NightActionData } from './types'

export function useSocketConnection(
  roomCode: string,
  socket: Socket,
  addToQueue: (audioEvent: AudioEvent) => void,
  setCurrentAudio: (audioEvent: AudioEvent | null) => void,
  forceRender: boolean,
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

  const { phase, setPhase } = useRoomStore()

  const [nightActions, setNightActions] = useState<NightActionData[]>([])

  useEffect(() => {
    socket.emit('rq_gm:connectGmRoom', { roomCode, gmRoomId: roomCode })

    const handlers = {
      'gm:connected': (data: {
        roomCode: string
        gmRoomId: string
        message: string
      }) => {
        setIsConnected(true)
        toast.success('GM đã kết nối thành công')
      },
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
      'gm:nightAction': (nightAction: NightActionData) => {
        setNightActions((prev) => [...prev, nightAction])
        addToQueue({
          type: 'nightAction',
          message: nightAction.message,
        })
      },
      'gm:votingAction': (data: { type: 'votingAction'; message: string }) => {
        addToQueue({
          type: data.type,
          message: data.message,
        })
      },
      'gm:gameEnded': (data: { type: 'gameEnded'; message: string }) => {
        addToQueue({
          type: data.type,
          message: data.message,
        })
      },
    } as const

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler as (...args: unknown[]) => void)
    })

    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event))
    }
  }, [roomCode, socket, setPhase, addToQueue, forceRender])

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
    handleNextPhase,
    handleEliminatePlayer,
    handleRevivePlayer,
    handleGetPlayers,
    handleSetMockPlayers,
    setCurrentAudio,
  }
}
