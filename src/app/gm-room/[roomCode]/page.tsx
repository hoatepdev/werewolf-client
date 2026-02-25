'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { useAudioQueue } from './modules/use-audio-queue'
import { useSocketConnection } from './modules/use-socket-connection'
import { AudioControl } from './modules/audio-control'
import { AudioQueue } from './modules/audio-queue'
import { NightActionLog } from './modules/night-action-log'
import { GameStatsCard } from './modules/game-stats'
import { PlayerList } from './modules/player-list'
import { MockPlayersComponent } from './modules/mock-player'

const GmRoomPage = () => {
  const socket = getSocket()
  const router = useRouter()
  const params = useParams<{ roomCode: string }>()
  const roomCode = params.roomCode

  const [gmLogs, setGmLogs] = useState<
    {
      type: string
      message: string
      data?: unknown
      timestamp?: number
    }[]
  >([])
  const [forceRender, setForceRender] = useState(false)

  const {
    isPlayingRef,
    audioQueue,
    currentAudio,
    addToQueue,
    audioStatus,
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
    handleSetMockPlayers,
  } = useSocketConnection(
    roomCode,
    socket,
    addToQueue,
    setCurrentAudio,
    forceRender,
  )

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
  }, [socket, forceRender])

  useEffect(() => {
    handleGetPlayers()
  }, [handleGetPlayers, forceRender])

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
            <MockPlayersComponent
              socket={socket}
              forceRender={forceRender}
              setForceRender={setForceRender}
              handleSetMockPlayers={handleSetMockPlayers}
            />
          </div>
        }
      />

      <div className="">
        <h2 className="mb-2 text-lg font-bold text-purple-400">
          🎮 Điều khiển game
        </h2>
        <div className="flex items-center gap-20">
          <Button
            variant="yellow"
            onClick={handleNextPhase}
            // disabled={['night', 'ended'].includes(phase)}
          >
            Giai đoạn tiếp theo
          </Button>
          <Button onClick={handleGetPlayers} className="">
            Làm mới danh sách
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-2">
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AudioControl
            currentAudio={currentAudio}
            isPlaying={isPlayingRef.current}
            audioStatus={audioStatus}
            stopAudio={() => setCurrentAudio(null)}
          />
          <AudioQueue audioQueue={audioQueue} playAudio={setCurrentAudio} />
        </div>
        <PlayerList
          players={players}
          onEliminate={handleEliminatePlayer}
          onRevive={handleRevivePlayer}
        />
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
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GameStatsCard gameStats={gameStats} />
        <NightActionLog nightActions={nightActions} />
      </div>
    </MainLayout>
  )
}

export default GmRoomPage
