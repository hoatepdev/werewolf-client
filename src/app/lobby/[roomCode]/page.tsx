'use client'
import React, { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import { PlayerGrid } from '@/components/PlayerGrid'
import { Player } from '@/types/player'
import { CornerUpLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { confirmDialog } from '@/components/ui/alert-dialog'
import RoleRandomizerModal from '@/components/RoleRandomizerModal'
import { LIST_ROLE } from '@/constants/role'
import { Role } from '@/types/role'
import { toast } from 'sonner'
import { renderAvatar } from '@/helpers'

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const socket = getSocket()
  const router = useRouter()
  const isGM = useRoomStore((s) => s.isGm)
  const [showMockPanel, setShowMockPanel] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [assignedRole, setAssignedRole] = useState<Role>(LIST_ROLE[0])

  const { roomCode } = React.use(params)
  console.log(
    '⭐ store',
    useRoomStore((s) => s),
  )

  const playerId = useRoomStore((s) => s.playerId)
  const approvedPlayers = useRoomStore((s) => s.approvedPlayers)
  const setApprovedPlayers = useRoomStore((s) => s.setApprovedPlayers)
  const username = useRoomStore((s) => s.username)
  const avatarKey = useRoomStore((s) => s.avatarKey)

  const handleStartGameSuccess = () => {
    toast.success('Game start after 3s')
    setTimeout(() => {
      router.push(`/room/${roomCode}`)
    }, 3000)
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
      toast.success('Random role after 3s')
      setTimeout(() => {
        const roleData = LIST_ROLE.find((r) => r.id === role) || LIST_ROLE[0]
        setAssignedRole(roleData)
        setShowRoleModal(true)
      }, 3000)
    })
    socket.on('room:readySuccess', handleStartGameSuccess)
    return () => {
      socket.off('room:updatePlayers')
      socket.off('player:assignedRole')
      socket.off('room:readySuccess')
    }
  }, [roomCode, playerId, isGM, setApprovedPlayers])

  const toggleMockDataPanel = () => setShowMockPanel(!showMockPanel)

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Leave Room',
      description: 'Are you sure you want to leave the room?',
      confirmText: 'Leave',
      cancelText: 'Cancel',
    })
    if (!confirmed) return
    // socket.emit("room:leave", { roomCode });
    router.push('/join-room')
  }

  const handleContinueRole = () => {
    socket.emit('rq_player:ready', { roomCode })
    // setShowRoleModal(false)
    // router.push(`/room/${roomCode}`)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex h-10 items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
            aria-label="Back"
            onClick={handleLeaveRoom}
          >
            <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
          </button>
        </div>
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          {isGM ? (
            <button
              className="text-zinc-400 transition-colors hover:text-yellow-400"
              onClick={toggleMockDataPanel}
              title="Toggle Mock Data Panel"
            >
              <Settings className="h-5 w-5" />
            </button>
          ) : username ? (
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
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">
            Lobby Code: <span className="text-yellow-400">{roomCode}</span>
          </h1>
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-12 text-center">
            <h2 className="font-semibold">
              Players ({approvedPlayers.length}/9)
            </h2>
          </div>
          <PlayerGrid
            players={approvedPlayers}
            currentPlayerId={playerId}
            mode="lobby"
          />
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
