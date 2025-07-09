'use client'
import React, { useEffect, useState, useCallback, useRef, use } from 'react'
import { getSocket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
import { CornerUpLeft, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MockDataPanel } from '@/components/MockDataPanel'
import GmMonitoring from '@/components/night/GmMonitoring'
import { Socket } from 'socket.io-client'

interface AudioEvent {
  type:
    | 'nightStart'
    | 'roleWake'
    | 'roleSleep'
    | 'nightEnd'
    | 'gameEnded'
    | 'nightAction'
    | 'phaseChange'
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
  const [queue, setQueue] = useState<string[]>([])
  const isPlayingRef = useRef(false)
  const [currentAudio, setCurrentAudio] = useState<AudioEvent | null>(null)
  const [audioQueue, setAudioQueue] = useState<AudioEvent[]>([])

  const addToQueue = useCallback((message: string) => {
    setQueue((prev) => [...prev, message])
  }, [])

  const processQueue = useCallback(() => {
    if (isPlayingRef.current || queue.length === 0) return
    isPlayingRef.current = true
    const message = queue[0]
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.onend = () => {
        isPlayingRef.current = false
        setQueue((prev) => prev.slice(1))
      }
      utterance.onerror = () => {
        isPlayingRef.current = false
        setQueue((prev) => prev.slice(1))
      }
      speechSynthesis.speak(utterance)
    } else {
      alert(message)
      isPlayingRef.current = false
      setQueue((prev) => prev.slice(1))
    }
  }, [queue])

  useEffect(() => {
    if (!isPlayingRef.current && queue.length > 0) {
      processQueue()
    }
  }, [queue, processQueue])

  return {
    addToQueue,
    queue,
    currentAudio,
    isPlayingRef,
    audioQueue,
    setCurrentAudio,
    setAudioQueue,
  }
}

const useSocketConnection = (
  roomCode: string,
  socket: Socket,
  addToQueue: (message: string) => void,
) => {
  const [isConnected, setIsConnected] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('night')
  const [nightActions, setNightActions] = useState<NightActionData[]>([])
  const [nightResult, setNightResult] = useState<{
    diedPlayerIds: string[]
    cause: string
  } | null>(null)

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
        toast.success('GM connected successfully')
      },
      'game:phaseChanged': (data: { phase: string }) => {
        setCurrentPhase(data.phase)
      },
      'game:nightResult': (data: {
        diedPlayerIds: string[]
        cause: string
      }) => {
        setNightResult(data)
      },
      'gm:nightAction': (nightAction: NightActionData) => {
        setNightActions((prev) => [...prev, nightAction])
        addToQueue(nightAction.message)
      },
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event))
    }
  }, [roomCode])

  const handleNextPhase = () => {
    socket.emit('rq_gm:nextPhase', { roomCode })
  }

  return {
    isConnected,
    currentPhase,
    nightActions,
    nightResult,
    handleNextPhase,
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
    <h2 className="mb-4 text-lg font-bold text-yellow-400">🎵 Audio Control</h2>
    {currentAudio ? (
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔊</span>
        <div className="flex-1">
          <p className="font-semibold text-white">{currentAudio.message}</p>
          {currentAudio.role && (
            <p className="text-sm text-gray-400">Role: {currentAudio.role}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="text-sm text-green-400">Playing...</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Ready</span>
          )}
          <button
            onClick={stopAudio}
            className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium hover:bg-red-700"
          >
            Stop
          </button>
        </div>
      </div>
    ) : (
      <p className="text-gray-400">No audio playing</p>
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
    <h2 className="mb-4 text-lg font-bold text-blue-400">📋 Audio Queue</h2>
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
              Play
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400">No audio in queue</p>
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
      🌙 Night Action Log
    </h2>
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {nightActions.length === 0 ? (
        <p className="text-sm text-gray-400">No night actions yet...</p>
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

const GmRoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const { roomCode } = use(params)
  const [showMockPanel, setShowMockPanel] = useState(false)

  console.log('rendered')

  const {
    addToQueue,
    currentAudio,
    isPlayingRef,
    audioQueue,
    setCurrentAudio,
    setAudioQueue,
  } = useAudioQueue()
  const {
    isConnected,
    currentPhase,
    nightActions,
    nightResult,
    handleNextPhase,
  } = useSocketConnection(roomCode, socket, addToQueue)

  useEffect(() => {
    console.log('🔌 Setting up audio listener')

    socket.on('gm:audio', (audioEvent: AudioEvent) => {
      console.log('📡 Received gm:audio event:', audioEvent)
      addToQueue(audioEvent.message)
      setCurrentAudio(audioEvent)
    })

    return () => {
      console.log('🔌 Cleaning up audio listener')
      socket.off('gm:audio')
    }
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex h-10 items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.push('/create-room')}>
            <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
          </button>
          <h1 className="ml-2 text-xl font-bold">{roomCode}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-zinc-400 transition-colors hover:text-yellow-400"
            onClick={() => setShowMockPanel(!showMockPanel)}
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-lg font-bold text-purple-400">
          🎮 Game Control
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNextPhase()}
            className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-700"
          >
            Next Phase
          </button>
        </div>
        <button
          onClick={() => addToQueue('Kiểm tra âm thanh')}
          className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-700"
        >
          Test Audio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NightActionLog nightActions={nightActions} />
        <AudioControl
          currentAudio={currentAudio}
          isPlaying={isPlayingRef.current}
          stopAudio={() => setCurrentAudio(null)}
        />
        <AudioQueue audioQueue={audioQueue} playAudio={setCurrentAudio} />
        <GmMonitoring />
      </div>

      <MockDataPanel
        isVisible={showMockPanel}
        toggleMockDataPanel={() => setShowMockPanel(!showMockPanel)}
      />
    </main>
  )
}

export default GmRoomPage
