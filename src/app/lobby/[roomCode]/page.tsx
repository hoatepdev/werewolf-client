'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { getStateRoomStore, useRoomStore } from '@/hook/useRoomStore'
import { PlayerGrid } from '@/components/PlayerGrid'
import { Player } from '@/types/player'
import { CornerUpLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { confirmDialog } from '@/components/ui/alert-dialog'
import RoleRandomizerModal from '@/components/RoleRandomizerModal'
import { LIST_ROLE } from '@/constants/role'
import { RoleObject } from '@/types/role'
import { toast } from 'sonner'
import { renderAvatar } from '@/helpers'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [assignedRole, setAssignedRole] = useState<RoleObject>(LIST_ROLE[0])

  const { roomCode } = React.use(params)
  console.log('⭐ store', getStateRoomStore())

  const {
    playerId,
    approvedPlayers,
    username,
    avatarKey,
    setRole,
    setApprovedPlayers,
    setAlive,
  } = useRoomStore()

  const handleStartGameSuccess = () => {
    toast.success('Bắt đầu game sau 2 giây ...')
    setTimeout(() => {
      router.push(`/room/${roomCode}`)
    }, 2000)
  }

  useEffect(() => {
    if (!socket.connected) socket.connect()
    socket.emit('rq_player:getPlayers', { roomCode })
    socket.on('room:updatePlayers', (data: Player[]) => {
      const approvedPlayers = data.filter(
        (player) => player.status === 'approved',
      )
      setApprovedPlayers(approvedPlayers)
    })
    socket.on('player:assignedRole', ({ role }: { role: Player['role'] }) => {
      setTimeout(() => {
        const roleData = LIST_ROLE.find((r) => r.id === role) || LIST_ROLE[0]
        setAssignedRole(roleData)
        setRole(roleData.id)
        setShowRoleModal(true)
      }, 1000)
    })
    socket.on('room:readySuccess', handleStartGameSuccess)
    return () => {
      socket.off('room:updatePlayers')
      socket.off('player:assignedRole')
      socket.off('room:readySuccess')
    }
  }, [roomCode, playerId, socket])

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Rời phòng',
      description: 'Bạn có chắc chắn muốn rời khỏi phòng?',
      confirmText: 'Rời đi',
      cancelText: 'Hủy',
    })
    if (!confirmed) return
    router.push('/join-room')
  }

  const handleContinueRole = () => {
    setAlive(true)
    socket.emit('rq_player:ready', { roomCode })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex h-10 items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
            aria-label="Quay lại"
            onClick={handleLeaveRoom}
          >
            <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
          </button>
          <h1 className="ml-2 text-xl font-bold">{roomCode}</h1>
        </div>
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="max-w-[80px] truncate text-sm font-semibold">
              {username}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-bold">
              <span className="text-2xl">
                {renderAvatar({ username, avatarKey })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">
            Mã phòng: <span className="text-yellow-400">{roomCode}</span>
          </h1>
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-12 text-center">
            <h2 className="font-semibold">
              Người chơi ({approvedPlayers.length}/9)
            </h2>
          </div>
          <PlayerGrid players={approvedPlayers} mode="lobby" />
        </div>
      </div>
      <RoleRandomizerModal
        assignedRole={assignedRole}
        onContinue={handleContinueRole}
        open={showRoleModal}
      />
    </main>
  )
}

export default RoomPage
