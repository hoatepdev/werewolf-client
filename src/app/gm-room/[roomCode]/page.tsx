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
import { TimerProvider } from '@/hook/useTimerContext'
import { GmGameHudContainer } from '@/components/game-hud'
import { formatRoomCode } from '@/lib/room-code'

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
    gmCommandError,
    pendingGmCommand,
    votingProgress,
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
    const isActiveGame = phase !== 'ended'
    const confirmed = await confirmDialog({
      title: isActiveGame ? 'Reset ván đang diễn ra?' : 'Chơi lại phòng này',
      description: isActiveGame
        ? 'Thao tác này sẽ dừng ván hiện tại và đưa tất cả người chơi về sảnh chờ trong cùng mã phòng. Chỉ dùng khi GM cần can thiệp khẩn cấp.'
        : 'Reset ván hiện tại và đưa tất cả người chơi về sảnh chờ trong cùng mã phòng?',
      confirmText: isActiveGame ? 'Reset cưỡng bức' : 'Chơi lại',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    resetRoom({
      force: isActiveGame,
      onSuccess: () => {
        setIsPrivateMode(false)
        setGmLogs([])
        router.push(`/approve-room/${roomCode}`)
      },
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
      <TimerProvider>
        <PageHeader title={formatRoomCode(roomCode)} onBack={handleLeaveRoom} />

        <GmGameHudContainer
          roomCode={roomCode}
          isConnected={isConnected}
          phase={phase}
          players={players}
          gameStats={gameStats}
          winner={winner}
          isPrivateMode={isPrivateMode}
          onLeave={handleLeaveRoom}
          onRefresh={handleGetPlayers}
          onOpenPrivate={togglePrivateMode}
          className="mb-6"
        />

        <div className="fixed top-44 right-4 z-40 w-72 max-w-[calc(100vw-2rem)] lg:top-40">
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
              roomCode={roomCode}
              isConnected={isConnected}
              phase={phase}
              onNextPhase={handleNextPhase}
              onRefresh={handleGetPlayers}
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
              gmCommandError={gmCommandError}
              pendingGmCommand={pendingGmCommand}
              votingProgress={votingProgress}
            />
          )}
        </AnimatePresence>
      </TimerProvider>
    </MainLayout>
  )
}

export default GmRoomPage
