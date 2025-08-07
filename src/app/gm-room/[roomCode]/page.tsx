'use client'
import React, { useEffect, useState, useCallback, useRef, use } from 'react'
import { getSocket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Socket } from 'socket.io-client'
import { useRoomStore } from '@/hook/useRoomStore'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { Player } from '@/types/player'
import { renderAvatar } from '@/helpers'
import type { GameStats } from '@/types/player'

interface AudioEvent {
  type:
    | 'nightStart'
    | 'roleWake'
    | 'roleSleep'
    | 'nightEnd'
    | 'gameEnded'
    | 'nightAction'
    | 'phaseChanged'
    | 'votingAction'
  role?: 'werewolf' | 'seer' | 'witch' | 'bodyguard'
  message: string
  timestamp?: number
  data?: NightActionData | { phase: string }
}

interface NightActionData {
  step: string
  action: string
  message: string
  timestamp: number
}

function useAudioQueue() {
  const isPlayingRef = useRef(false)
  const [currentAudio, setCurrentAudio] = useState<AudioEvent | null>(null)
  const [audioQueue, setAudioQueue] = useState<AudioEvent[]>([])

  console.log('🔊 currentAudio', currentAudio)
  console.log('🔊 audioQueue', audioQueue)

  const addToQueue = useCallback((audioEvent: AudioEvent) => {
    setCurrentAudio(audioEvent)
    setAudioQueue((prev) => [...prev, audioEvent])
  }, [])

  const processQueue = useCallback(() => {
    if (isPlayingRef.current || audioQueue.length === 0) return
    isPlayingRef.current = true
    const message = audioQueue[0].message
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.onend = () => {
        setTimeout(() => {
          isPlayingRef.current = false
          setCurrentAudio(audioQueue[1])
          setAudioQueue((prev) => prev.slice(1))
        }, 1000)
      }
      utterance.onerror = () => {
        setTimeout(() => {
          isPlayingRef.current = false
          setCurrentAudio(audioQueue[1])
          setAudioQueue((prev) => prev.slice(1))
        }, 1000)
      }
      speechSynthesis.speak(utterance)
    } else {
      alert(message)
      setTimeout(() => {
        isPlayingRef.current = false
        setCurrentAudio(audioQueue[1])
        setAudioQueue((prev) => prev.slice(1))
      }, 1000)
    }
  }, [audioQueue])

  useEffect(() => {
    if (!isPlayingRef.current && audioQueue.length > 0) {
      processQueue()
    }
  }, [audioQueue, processQueue])

  return {
    addToQueue,
    audioQueue,
    currentAudio,
    isPlayingRef,
    setCurrentAudio,
    setAudioQueue,
  }
}

const useSocketConnection = (
  roomCode: string,
  socket: Socket,
  addToQueue: (audioEvent: AudioEvent) => void,
  setCurrentAudio: (audioEvent: AudioEvent) => void,
) => {
  const [isConnected, setIsConnected] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameStats, setGameStats] = useState({
    totalPlayers: 0,
    alivePlayers: 0,
    deadPlayers: 0,
    werewolves: 0,
    villagers: 0,
  })

  const { phase, setPhase } = useRoomStore()

  const [nightActions, setNightActions] = useState<NightActionData[]>([])

  useEffect(() => {
    const gmRoomId = `gm_${roomCode}`

    socket.emit('rq_gm:connectGmRoom', { roomCode, gmRoomId })

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
      'gm:playersUpdate': (data: { players: Player[] }) => {
        setPlayers(data.players)
        updateGameStats(data.players)
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
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event))
    }
  }, [roomCode])

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

  const handleEliminatePlayer = (playerId: string, reason: string) => {
    socket.emit('rq_gm:eliminatePlayer', { roomCode, playerId, reason })
    toast.success(`Đã loại bỏ người chơi: ${reason}`)
  }

  const handleRevivePlayer = (playerId: string) => {
    socket.emit('rq_gm:revivePlayer', { roomCode, playerId })
    toast.success('Đã hồi sinh người chơi')
  }

  const handleGetPlayers = () => {
    socket.emit('rq_gm:getPlayers', { roomCode })
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
    setCurrentAudio,
  }
}

const AudioControl = ({
  currentAudio,
  isPlaying,
  stopAudio,
}: {
  currentAudio: AudioEvent | null
  isPlaying: boolean
  stopAudio: () => void
}) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-yellow-400">
      🎵 Điều khiển âm thanh
    </h2>
    {currentAudio ? (
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔊</span>
        <div className="flex-1">
          <p className="font-semibold text-white">{currentAudio.message}</p>
          {currentAudio.role && (
            <p className="text-sm text-gray-400">Vai: {currentAudio.role}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="text-sm text-green-400">Đang phát...</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Sẵn sàng</span>
          )}
          <button
            onClick={stopAudio}
            className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium hover:bg-red-700"
          >
            Dừng
          </button>
        </div>
      </div>
    ) : (
      <p className="text-gray-400">Không có âm thanh đang phát</p>
    )}
  </div>
)

const AudioQueue = ({
  audioQueue,
  playAudio,
}: {
  audioQueue: AudioEvent[]
  playAudio: (audio: AudioEvent | null) => void
}) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-blue-400">
      📋 Hàng đợi âm thanh
    </h2>
    {audioQueue.length > 0 ? (
      <div className="space-y-2">
        {audioQueue.map((audio: AudioEvent, index: number) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-gray-700 p-3"
          >
            <span className="text-lg">🔊</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{audio.message}</p>
              {audio.role && (
                <p className="text-xs text-gray-400">{audio.role}</p>
              )}
            </div>
            <button
              onClick={() => playAudio(audio)}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium hover:bg-blue-700"
            >
              Phát
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400">Không có âm thanh trong hàng đợi</p>
    )}
  </div>
)

const NightActionLog = ({
  nightActions,
}: {
  nightActions: NightActionData[]
}) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-blue-400">
      🌙 Nhật ký hành động đêm
    </h2>
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {nightActions.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có hành động đêm nào...</p>
      ) : (
        nightActions.map((action, index) => (
          <div key={index} className="rounded bg-gray-700 p-3">
            <p className="text-sm font-medium text-white">{action.message}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(action.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)

const GameStats = ({ gameStats }: { gameStats: GameStats }) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-green-400">📊 Thống kê game</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-white">
          {gameStats.totalPlayers}
        </p>
        <p className="text-sm text-gray-400">Tổng người chơi</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-400">
          {gameStats.alivePlayers}
        </p>
        <p className="text-sm text-gray-400">Còn sống</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-400">
          {gameStats.deadPlayers}
        </p>
        <p className="text-sm text-gray-400">Đã chết</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-400">
          {gameStats.werewolves}
        </p>
        <p className="text-sm text-gray-400">Sói còn sống</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-400">
          {gameStats.villagers}
        </p>
        <p className="text-sm text-gray-400">Dân làng còn sống</p>
      </div>
    </div>
  </div>
)

const PlayerList = ({
  players,
  onEliminate,
  onRevive,
}: {
  players: Player[]
  onEliminate: (playerId: string, reason: string) => void
  onRevive: (playerId: string) => void
}) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-purple-400">
      👥 Danh sách người chơi
    </h2>
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {players.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có người chơi nào...</p>
      ) : (
        players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 rounded-lg p-3 ${
              player.alive ? 'bg-gray-700' : 'bg-red-900/50'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
              {renderAvatar(player)}
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${player.alive ? 'text-white' : 'text-red-300'}`}
              >
                {player.username}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`rounded px-2 py-1 ${
                    player.role === 'werewolf'
                      ? 'bg-red-600'
                      : player.role === 'seer'
                        ? 'bg-blue-600'
                        : player.role === 'witch'
                          ? 'bg-purple-600'
                          : player.role === 'hunter'
                            ? 'bg-orange-600'
                            : player.role === 'bodyguard'
                              ? 'bg-green-600'
                              : player.role === 'tanner'
                                ? 'bg-yellow-600'
                                : 'bg-gray-600'
                  }`}
                >
                  {player.role || 'Chưa phân vai'}
                </span>
                <span
                  className={`rounded px-2 py-1 ${
                    player.alive ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {player.alive ? 'Sống' : 'Chết'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {player.alive ? (
                <button
                  onClick={() => onEliminate(player.id, 'GM loại bỏ')}
                  className="rounded bg-red-600 px-2 py-1 text-xs font-medium hover:bg-red-700"
                >
                  Loại bỏ
                </button>
              ) : (
                <button
                  onClick={() => onRevive(player.id)}
                  className="rounded bg-green-600 px-2 py-1 text-xs font-medium hover:bg-green-700"
                >
                  Hồi sinh
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)

const GmRoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const { roomCode } = use(params)

  const {
    isPlayingRef,
    audioQueue,
    currentAudio,
    addToQueue,
    setCurrentAudio,
  } = useAudioQueue()

  const {
    isConnected,
    phase,
    players,
    gameStats,
    nightActions,
    handleNextPhase,
    handleEliminatePlayer,
    handleRevivePlayer,
    handleGetPlayers,
  } = useSocketConnection(roomCode, socket, addToQueue, setCurrentAudio)

  const [gmLogs, setGmLogs] = useState<
    {
      type: string
      message: string
      data?: unknown
      timestamp?: number
    }[]
  >([])

  useEffect(() => {
    const handleLog =
      (type: string) => (data: { message: string; timestamp?: number }) => {
        setGmLogs((logs) => [
          ...logs,
          {
            type,
            message: data.message,
            data,
            timestamp: data.timestamp || Date.now(),
          },
        ])
      }
    socket.on('gm:nightAction', handleLog('night'))
    socket.on('gm:votingAction', handleLog('voting'))
    socket.on('gm:gameEnded', handleLog('end'))
    return () => {
      socket.off('gm:nightAction', handleLog('night'))
      socket.off('gm:votingAction', handleLog('voting'))
      socket.off('gm:gameEnded', handleLog('end'))
    }
  }, [socket])

  useEffect(() => {
    handleGetPlayers()
  }, [])

  return (
    <MainLayout maxWidth="max-w-6xl">
      <PageHeader
        title={roomCode}
        onBack={() => router.push('/create-room')}
        right={
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
            </span>
          </div>
        }
      />

      <div className="mb-4">
        <h2 className="mb-2 text-lg font-bold text-purple-400">
          🎮 Điều khiển game
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="yellow" onClick={handleNextPhase} className="">
            Giai đoạn tiếp theo
          </Button>
          <Button onClick={handleGetPlayers} className="">
            Làm mới danh sách
          </Button>
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm text-gray-300">Giai đoạn hiện tại:</span>
            <span
              className={`rounded px-2 py-1 text-sm font-medium ${
                phase === 'night'
                  ? 'bg-blue-600'
                  : phase === 'day'
                    ? 'bg-yellow-600'
                    : phase === 'voting'
                      ? 'bg-red-600'
                      : phase === 'ended'
                        ? 'bg-gray-600'
                        : 'bg-gray-600'
              }`}
            >
              {phase === 'night'
                ? 'Đêm'
                : phase === 'day'
                  ? 'Ngày'
                  : phase === 'voting'
                    ? 'Bỏ phiếu'
                    : phase === 'ended'
                      ? 'Kết thúc'
                      : 'Chưa bắt đầu'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <GameStats gameStats={gameStats} />
        <PlayerList
          players={players}
          onEliminate={handleEliminatePlayer}
          onRevive={handleRevivePlayer}
        />
        <NightActionLog nightActions={nightActions} />
        <AudioControl
          currentAudio={currentAudio}
          isPlaying={isPlayingRef.current}
          stopAudio={() => setCurrentAudio(null)}
        />
        <AudioQueue audioQueue={audioQueue} playAudio={setCurrentAudio} />
      </div>

      <div className="mt-6 max-h-96 overflow-y-auto rounded-lg bg-zinc-800 p-4">
        <h3 className="mb-2 font-bold text-yellow-400">Lịch sử game (log)</h3>
        <ul className="space-y-1 text-sm">
          {gmLogs.map((log, idx) => (
            <li key={idx}>
              <span className="text-zinc-400">
                [{new Date(log.timestamp!).toLocaleTimeString()}]
              </span>
              <span className="ml-2 font-semibold">
                {log.type.toUpperCase()}:
              </span>
              <span className="ml-2">{log.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  )
}

export default GmRoomPage
