'use client'
import React, { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getSocket } from '@/lib/socket'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { useAudioQueue } from './modules/use-audio-queue'
import { useSocketConnection } from './modules/use-socket-connection'
import { TableLayer } from './modules/table-layer'
import { PrivateOverlay } from './modules/private-overlay'
import type { GmLogEntry } from './modules/types'

const GmRoomPage = () => {
  const socket = getSocket()
  const router = useRouter()
  const params = useParams<{ roomCode: string }>()
  const roomCode = params.roomCode

  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [gmLogs, setGmLogs] = useState<GmLogEntry[]>([])
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
      (type: string, sensitive: boolean) =>
      (data: { message: string; timestamp?: number }) => {
        setGmLogs((logs) => [
          ...logs,
          {
            type,
            message: data.message,
            data,
            timestamp: data.timestamp || Date.now(),
            sensitive,
          },
        ])
      }
    socket.on('gm:nightAction', handleLog('night', true))
    socket.on('gm:votingAction', handleLog('voting', false))
    socket.on('gm:gameEnded', handleLog('end', false))
    return () => {
      socket.off('gm:nightAction')
      socket.off('gm:votingAction')
      socket.off('gm:gameEnded')
    }
  }, [socket, forceRender])

  useEffect(() => {
    handleGetPlayers()
  }, [handleGetPlayers, forceRender])

  const togglePrivateMode = () => setIsPrivateMode((prev) => !prev)

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

      <TableLayer
        phase={phase}
        onNextPhase={handleNextPhase}
        currentAudio={currentAudio}
        isPlaying={isPlayingRef.current}
        audioStatus={audioStatus}
        stopAudio={() => setCurrentAudio(null)}
        audioQueue={audioQueue}
        playAudio={setCurrentAudio}
        players={players}
        gameStats={gameStats}
        gmLogs={gmLogs}
        onActivatePrivate={togglePrivateMode}
        onRefresh={handleGetPlayers}
      />

      <AnimatePresence>
        {isPrivateMode && (
          <PrivateOverlay
            onClose={togglePrivateMode}
            phase={phase}
            onNextPhase={handleNextPhase}
            players={players}
            onEliminate={handleEliminatePlayer}
            onRevive={handleRevivePlayer}
            gameStats={gameStats}
            nightActions={nightActions}
            gmLogs={gmLogs}
            socket={socket}
            forceRender={forceRender}
            setForceRender={setForceRender}
            handleSetMockPlayers={handleSetMockPlayers}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  )
}

export default GmRoomPage
