'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getSocket } from '@/lib/socket'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { useAudioQueue } from './modules/use-audio-queue'
import { useSocketConnection } from './modules/use-socket-connection'
import { TableLayer } from './modules/table-layer'
import { PrivateOverlay } from './modules/private-overlay'
import { confirmDialog } from '@/components/ui/alert-dialog'
import type { GmLogEntry } from './modules/types'
import { useRoomStore } from '@/hook/useRoomStore'
import { FCMNotification } from '@/components/FCMNotification'

const GmRoomPage = () => {
  const socket = getSocket()
  const router = useRouter()
  const params = useParams<{ roomCode: string }>()
  const roomCode = params.roomCode

  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [gmLogs, setGmLogs] = useState<GmLogEntry[]>([])
  const [forceRender, setForceRender] = useState(false)
  const clearSavedSession = useRoomStore((state) => state.clearSavedSession)

  const handleReconnectFailed = useCallback(() => {
    clearSavedSession()
    router.replace('/')
  }, [clearSavedSession, router])

  const handleSnapshotLogs = useCallback((logs: GmLogEntry[]) => {
    setGmLogs(logs)
  }, [])

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
    winner,
    handleNextPhase,
    handleEliminatePlayer,
    handleRevivePlayer,
    handleGetPlayers,
    handleResetRoom: resetRoom,
    handleSetMockPlayers,
  } = useSocketConnection(
    roomCode,
    socket,
    addToQueue,
    setCurrentAudio,
    forceRender,
    handleReconnectFailed,
    handleSnapshotLogs,
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
    const handleNightLog = handleLog('night', true)
    const handleVotingLog = handleLog('voting', false)
    const handleEndLog = handleLog('end', false)

    socket.on('gm:nightAction', handleNightLog)
    socket.on('gm:votingAction', handleVotingLog)
    socket.on('gm:gameEnded', handleEndLog)
    return () => {
      socket.off('gm:nightAction', handleNightLog)
      socket.off('gm:votingAction', handleVotingLog)
      socket.off('gm:gameEnded', handleEndLog)
    }
  }, [socket])

  useEffect(() => {
    handleGetPlayers()
  }, [handleGetPlayers, forceRender])

  useEffect(() => {
    if (phase === 'ended') {
      setIsPrivateMode(true)
    }
  }, [phase])

  const togglePrivateMode = () => setIsPrivateMode((prev) => !prev)

  const handleResetRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Chơi lại phòng này',
      description:
        'Reset ván hiện tại và đưa tất cả người chơi về sảnh chờ trong cùng mã phòng?',
      confirmText: 'Chơi lại',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    resetRoom(() => {
      setIsPrivateMode(false)
      setGmLogs([])
      router.push(`/approve-room/${roomCode}`)
    })
  }

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Rời phòng',
      description: 'Bạn có chắc chắn muốn rời phòng?',
      confirmText: 'Rời đi',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    router.push('/create-room')
  }

  return (
    <MainLayout maxWidth="max-w-6xl">
      <PageHeader
        title={roomCode}
        onBack={handleLeaveRoom}
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

      <div className="fixed top-20 right-4 z-40 w-72 max-w-[calc(100vw-2rem)]">
        <FCMNotification roomCode={roomCode} participantKind="gm" />
      </div>

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
            onResetRoom={handleResetRoom}
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
            winner={winner}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  )
}

export default GmRoomPage
