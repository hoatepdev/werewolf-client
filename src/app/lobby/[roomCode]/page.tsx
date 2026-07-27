'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import { PlayerGrid } from '@/components/PlayerGrid'
import { Player } from '@/types/player'
import { useRouter } from 'next/navigation'
import { confirmDialog } from '@/components/ui/alert-dialog'
import RoleRandomizerModal from '@/components/RoleRandomizerModal'
import { LIST_ROLE } from '@/constants/role'
import { RoleObject } from '@/types/role'
import { toast } from 'sonner'
import { renderAvatar } from '@/helpers'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { FCMNotification } from '@/components/FCMNotification'
import { ReadyChecklist } from '@/components/ReadyChecklist'
import { formatRoomCode } from '@/lib/room-code'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [assignedRole, setAssignedRole] = useState<RoleObject>(LIST_ROLE[0])
  const [hasAssignedRole, setHasAssignedRole] = useState(false)

  const { roomCode } = React.use(params)

  type PlayerStateSnapshot = {
    gameStarted?: boolean
    playerId?: string
    role?: Player['role']
    alive?: boolean | null
    players?: Player[]
  }

  const {
    playerId,
    approvedPlayers,
    username,
    avatarKey,
    role,
    persistentPlayerId,
    reconnectToken,
    rehydrated,
    setPlayerId,
    setRole,
    setApprovedPlayers,
    setAlive,
    setUsername,
    setAvatarKey,
    clearPlayerRoomSession,
  } = useRoomStore()

  useEffect(() => {
    if (!rehydrated) return

    let recoveryTimeout: ReturnType<typeof setTimeout> | undefined

    const clearRecoveryTimeout = () => {
      if (recoveryTimeout) clearTimeout(recoveryTimeout)
    }

    const handleRecoveryFailure = (message?: string) => {
      clearRecoveryTimeout()
      toast.error(
        message ||
          'Không thể khôi phục phiên. Phòng có thể đã hết hạn hoặc phiên trên thiết bị này không còn hợp lệ.',
      )
      clearPlayerRoomSession()
      router.replace('/')
    }

    const applyPlayers = (data: Player[]) => {
      const approvedPlayers = data.filter(
        (player) => player.status === 'approved',
      )
      setApprovedPlayers(approvedPlayers)
    }

    const applyRole = (nextRole?: Player['role']) => {
      if (!nextRole) return
      const roleData = LIST_ROLE.find((r) => r.id === nextRole) || LIST_ROLE[0]
      setAssignedRole(roleData)
      setRole(roleData.id)
      setHasAssignedRole(true)
    }

    const emitRejoin = () => {
      if (!persistentPlayerId || !reconnectToken) {
        handleRecoveryFailure('Không tìm thấy phiên phòng cũ.')
        return
      }

      toast.info('Đang khôi phục phiên...')
      socket.emit('rq_player:rejoinRoom', {
        roomCode,
        persistentPlayerId,
        reconnectToken,
      })
      recoveryTimeout = setTimeout(() => {
        handleRecoveryFailure()
      }, 5000)
    }

    const handleUpdatePlayers = (data: Player[]) => {
      applyPlayers(data)
    }
    const handleInfoUpdated = (data: {
      playerId: string
      username: string
      avatarKey: number
    }) => {
      if (data.playerId !== useRoomStore.getState().playerId) return
      setUsername(data.username)
      setAvatarKey(data.avatarKey)
    }
    const handlePlayerLeft = (data: {
      username: string
      activeGame: boolean
    }) => {
      if (data.username) toast.info(`${data.username} đã rời phòng`)
    }
    const handleAssignedRole = ({ role }: { role: Player['role'] }) => {
      setTimeout(() => {
        applyRole(role)
        setShowRoleModal(true)
      }, 1000)
    }
    const handleReadySuccess = () => {
      setShowRoleModal(false)
      toast.success('Bắt đầu game...')
      setTimeout(() => {
        router.push(`/room/${roomCode}`)
      }, 2000)
    }
    const handlePlayerDisconnected = ({
      username,
    }: {
      playerId: string
      username: string
    }) => {
      toast.warning(`${username} đã mất kết nối`)
    }
    const handlePlayerRejoined = (data: {
      playerId?: string
      role?: Player['role']
      players?: Player[]
      alive?: boolean | null
    }) => {
      if (data.playerId) setPlayerId(data.playerId)
      applyRole(data.role)
      if (data.players) applyPlayers(data.players)
      if (typeof data.alive === 'boolean') setAlive(data.alive)
    }
    const handlePlayerSnapshot = (snapshot: PlayerStateSnapshot) => {
      clearRecoveryTimeout()
      if (snapshot.playerId) setPlayerId(snapshot.playerId)
      applyRole(snapshot.role)
      if (snapshot.players) applyPlayers(snapshot.players)
      if (typeof snapshot.alive === 'boolean' || snapshot.alive === null) {
        setAlive(snapshot.alive)
      }
      if (snapshot.gameStarted) {
        router.replace(`/room/${roomCode}`)
      }
    }
    const handlePlayerRejoinError = (data: { message?: string }) => {
      handleRecoveryFailure(data.message)
    }
    const handleDisconnect = () => {
      toast.warning('Mất kết nối. Đang thử kết nối lại...')
    }
    const handleConnectError = () => {
      toast.warning('Chưa kết nối được máy chủ. Đang thử lại...')
    }

    socket.on('connect', emitRejoin)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('room:updatePlayers', handleUpdatePlayers)
    socket.on('player:rejoined', handlePlayerRejoined)
    socket.on('player:stateSnapshot', handlePlayerSnapshot)
    socket.on('player:rejoinRoomError', handlePlayerRejoinError)
    socket.on('player:assignedRole', handleAssignedRole)
    socket.on('room:readySuccess', handleReadySuccess)
    socket.on('room:playerDisconnected', handlePlayerDisconnected)
    socket.on('player:infoUpdated', handleInfoUpdated)
    socket.on('room:playerLeft', handlePlayerLeft)

    if (socket.connected) {
      emitRejoin()
    } else {
      socket.connect()
    }

    return () => {
      clearRecoveryTimeout()
      socket.off('connect', emitRejoin)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('room:updatePlayers', handleUpdatePlayers)
      socket.off('player:rejoined', handlePlayerRejoined)
      socket.off('player:stateSnapshot', handlePlayerSnapshot)
      socket.off('player:rejoinRoomError', handlePlayerRejoinError)
      socket.off('player:assignedRole', handleAssignedRole)
      socket.off('room:readySuccess', handleReadySuccess)
      socket.off('room:playerDisconnected', handlePlayerDisconnected)
      socket.off('player:infoUpdated', handleInfoUpdated)
      socket.off('room:playerLeft', handlePlayerLeft)
    }
  }, [
    persistentPlayerId,
    reconnectToken,
    rehydrated,
    roomCode,
    router,
    clearPlayerRoomSession,
    setAlive,
    setApprovedPlayers,
    setAvatarKey,
    setPlayerId,
    setRole,
    setUsername,
    socket,
  ])

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Rời phòng',
      description: 'Bạn có chắc chắn muốn rời khỏi phòng?',
      confirmText: 'Rời đi',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    socket.emit(
      'rq_player:leaveRoom',
      { roomCode },
      (ack?: { success: boolean; message?: string }) => {
        if (!ack?.success) {
          toast.error(ack?.message || 'Không thể rời phòng')
          return
        }
        clearPlayerRoomSession()
        toast.success(ack.message || 'Bạn đã rời phòng')
        router.push('/join-room')
      },
    )
  }

  const handleUpdateProfile = async () => {
    const confirmed = await confirmDialog({
      title: 'Cập nhật thông tin',
      description: 'Đồng bộ tên và avatar hiện tại của bạn với phòng này?',
      confirmText: 'Cập nhật',
      cancelText: 'Hủy',
    })
    if (!confirmed) return

    socket.emit(
      'rq_player:updateInfo',
      { roomCode, username, avatarKey },
      (ack?: { success: boolean; message?: string }) => {
        if (!ack?.success) {
          toast.error(ack?.message || 'Không thể cập nhật thông tin')
          return
        }
        toast.success(ack.message || 'Đã cập nhật thông tin')
      },
    )
  }

  const handleContinueRole = () => {
    setAlive(true)
    socket.emit('rq_player:ready', { roomCode })
  }

  return (
    <MainLayout>
      <PageHeader
        title={formatRoomCode(roomCode)}
        onBack={handleLeaveRoom}
        right={
          <button
            className="flex min-w-[120px] items-center justify-end gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-800"
            onClick={handleUpdateProfile}
            aria-label="Cập nhật thông tin trong phòng"
          >
            <span className="max-w-[80px] truncate text-sm font-semibold">
              {username}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-bold">
              <span className="text-2xl">
                {renderAvatar({ username, avatarKey })}
              </span>
            </div>
          </button>
        }
      />

      <div className="flex flex-1 flex-col items-center">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">
            Mã phòng:{' '}
            <span className="tracking-[0.35em] text-yellow-400">
              {formatRoomCode(roomCode)}
            </span>
          </h1>
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h2 className="font-semibold">
              Người chơi ({approvedPlayers.length}/9)
            </h2>
          </div>
          <div className="mb-8">
            <FCMNotification roomCode={roomCode} participantKind="player" />
          </div>
          <PlayerGrid players={approvedPlayers} mode="lobby" />
          <div className="mt-6">
            <ReadyChecklist
              players={approvedPlayers}
              currentPlayerId={playerId}
              assignedRoles={hasAssignedRole || Boolean(role)}
            />
          </div>
        </div>
      </div>
      <RoleRandomizerModal
        assignedRole={assignedRole}
        onContinue={handleContinueRole}
        open={showRoleModal}
      />
    </MainLayout>
  )
}

export default RoomPage
