'use client'
import React, { useState, useEffect } from 'react'
import { Check, Loader2Icon, ScanQrCode, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import { getStateRoomStore, useRoomStore } from '@/hook/useRoomStore'
import { getSocket } from '@/lib/socket'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Player } from '@/types/player'
import { RoleSelection } from '@/components/RoleSelection'
import { renderAvatar } from '@/helpers'
import { Button } from '@/components/ui/button'
import { MIN_PLAYER } from '@/constants'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'

const initialApproved: Player[] = []
const initialPending: Player[] = []

export default function ApprovePlayerPage() {
  const socket = getSocket()
  const router = useRouter()

  const [approvedPlayers, setApprovedPlayers] = useState(initialApproved)
  const [pendingPlayers, setPendingPlayers] = useState(initialPending)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [textButton, setTextButton] = useState('Phân vai ngẫu nhiên')

  const { roomCode, setApprovedPlayers: setApprovedPlayersStore } =
    useRoomStore()

  console.log('⭐ store', getStateRoomStore())
  const handleStartGameSuccess = () => {
    toast.success('Bắt đầu game sau 2 giây ...')
    setTimeout(() => {
      router.push(`/gm-room/${roomCode}`)
    }, 2000)
  }

  const handleDataPlayers = (data: Player[]) => {
    console.log('⭐ data', data)

    const approvedPlayers: Player[] = []
    const pendingPlayers: Player[] = []

    data.forEach((player: Player) => {
      if (player.status === 'approved') {
        approvedPlayers.push(player)
      } else if (player.status === 'pending') {
        pendingPlayers.push(player)
      }
    })

    setPendingPlayers(pendingPlayers)
    setApprovedPlayers(approvedPlayers)
    setApprovedPlayersStore(approvedPlayers)
  }

  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.emit('rq_gm:getPlayers', { roomCode })

    socket.on('gm:playersUpdate', handleDataPlayers)
    socket.on('room:readySuccess', handleStartGameSuccess)
    return () => {
      socket.off('gm:playersUpdate')
      socket.off('room:readySuccess')
    }
  }, [roomCode, router])

  const handleApprove = (player: Player) => {
    setApprovedPlayers((prev) => [...prev, player])
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id))
    if (!socket.connected) socket.connect()
    socket.emit('rq_gm:approvePlayer', { roomCode, playerId: player.id })
  }

  const handleReject = (player: Player) => {
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id))
    if (!socket.connected) socket.connect()
    socket.emit('rq_gm:rejectPlayer', { roomCode, playerId: player.id })
  }

  const handleRoleChange = (roles: string[]) => {
    setSelectedRoles(roles)
  }

  const handleRandomizeRoles = () => {
    setLoading(true)
    setTextButton('Chờ người chơi chọn vai')
    socket.emit(
      'rq_gm:randomizeRoles',
      {
        roomCode,
        roles: selectedRoles,
      },
      (message: string) => {
        if (message) {
          setLoading(false)
          toast.error(message || 'Không thể phân vai ngẫu nhiên')
        } else {
          setTextButton('Chờ người chơi sẵn sàng')
        }
      },
    )
  }

  const countPlayer = approvedPlayers.length
  const canContinue =
    approvedPlayers.length >= MIN_PLAYER &&
    approvedPlayers.length === selectedRoles.length

  return (
    <MainLayout>
      <PageHeader
        title="Phê duyệt người chơi"
        right={
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="text-2xl text-yellow-400 hover:text-yellow-500"
                aria-label="Quét mã QR"
              >
                <ScanQrCode className="h-6 w-6" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mã QR tham gia game</DialogTitle>
                <DialogDescription>
                  Quét mã QR này để tham gia game
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-xl bg-white p-2">
                  {roomCode ? (
                    <QRCode
                      value={roomCode}
                      size={180}
                      bgColor="#fff"
                      fgColor="#000"
                      style={{ borderRadius: '0.75rem' }}
                    />
                  ) : (
                    <span className="text-gray-400">Không có mã phòng</span>
                  )}
                </div>
                <div className="mb-4 text-center text-2xl font-bold text-yellow-400">
                  {roomCode}
                </div>
                <DialogClose asChild>
                  <button
                    className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-200 hover:bg-zinc-700"
                    aria-label="Đóng hộp thoại QR"
                  >
                    Đóng
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <div className="mb-2 text-base font-semibold tracking-wide">
            NGƯỜI CHƠI ĐÃ DUYỆT
          </div>
          <div className="mb-6 space-y-2">
            {approvedPlayers.length === 0 ? (
              <div className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-zinc-400">
                Không có người chơi
              </div>
            ) : (
              approvedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-zinc-800 px-4 py-3"
                >
                  <span className="flex w-6 items-center justify-center text-2xl font-bold text-yellow-400">
                    {renderAvatar(player)}
                  </span>
                  <span className="flex-1 text-base font-medium">
                    {player.username}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mb-2 text-base font-semibold tracking-wide">
            NGƯỜI CHƠI CHỜ DUYỆT
          </div>
          <div className="mb-6 space-y-2">
            {pendingPlayers.length === 0 ? (
              <div className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-zinc-400">
                Không có người chơi
              </div>
            ) : (
              pendingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-zinc-800 px-4 py-3"
                >
                  <span className="flex w-6 items-center justify-center text-2xl font-bold text-yellow-400">
                    {renderAvatar(player)}
                  </span>
                  <span className="flex-1 text-base font-medium">
                    {player.username}
                  </span>
                  <div className="flex gap-4">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-500 text-lg text-green-500 hover:bg-green-600 hover:text-white focus:outline-none"
                      onClick={() => {
                        handleApprove(player)
                      }}
                      aria-label="Duyệt"
                    >
                      <Check className="h-6 w-6" />
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 text-lg text-red-500 hover:bg-red-600 hover:text-white focus:outline-none active:bg-red-700"
                      onClick={() => {
                        handleReject(player)
                      }}
                      aria-label="Từ chối"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {countPlayer >= 0 && (
          <>
            <hr className="my-4 w-full border-t border-zinc-700" />
            <RoleSelection
              onChange={handleRoleChange}
              totalCount={countPlayer}
            />
          </>
        )}
      </div>

      <div className="mx-auto mt-auto mb-2 flex w-full max-w-sm flex-col">
        <div className="mb-2 text-center text-sm text-zinc-400">
          Nhấn TIẾP TỤC sẽ phân vai ngẫu nhiên cho người chơi.
        </div>
        <Button
          variant="yellow"
          className="w-full"
          disabled={!canContinue}
          onClick={handleRandomizeRoles}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" />
              <span>{textButton}</span>
            </div>
          ) : (
            <div>{textButton}</div>
          )}
        </Button>
      </div>
    </MainLayout>
  )
}
