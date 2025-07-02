'use client'
import React, { useState, useEffect } from 'react'
import { Check, CornerUpLeft, Loader2Icon, ScanQrCode, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import { useRoomStore } from '@/hook/useRoomStore'
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

const initialApproved: { id: number; username: string; avatarKey: number }[] =
  []
const initialPending: { id: number; username: string; avatarKey: number }[] = []

export default function ApprovePlayerPage() {
  const socket = getSocket()
  const router = useRouter()

  const [approvedPlayers, setApprovedPlayers] = useState(initialApproved)
  const [pendingPlayers, setPendingPlayers] = useState(initialPending)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [textButton, setTextButton] = useState('Randomize Roles')

  const roomCode = useRoomStore((s) => s.roomCode)

  const handleStartGameSuccess = () => {
    toast.success('Game start after 3s')
    setTimeout(() => {
      router.push(`/room/${roomCode}`)
    }, 3000)
  }

  const handleDataPlayers = (data: Player[]) => {
    const approvedPlayers: Player[] = []
    const pendingPlayers: Player[] = []

    data.forEach((player: Player) => {
      if (player.status === 'approved') {
        approvedPlayers.push(player)
      } else if (player.status === 'pending') {
        pendingPlayers.push(player)
      }
    })
    setApprovedPlayers(approvedPlayers)
    setPendingPlayers(pendingPlayers)
  }

  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.emit('rq_gm:getPlayers', { roomCode })

    socket.on('room:updatePlayers', handleDataPlayers)
    socket.on('room:readySuccess', handleStartGameSuccess)
    return () => {
      socket.off('room:updatePlayers')
      socket.off('room:readySuccess')
    }
  }, [roomCode, router])

  const handleApprove = (player: {
    id: number
    username: string
    avatarKey: number
  }) => {
    setApprovedPlayers((prev) => [...prev, player])
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id))
    if (!socket.connected) socket.connect()
    socket.emit('rq_gm:approvePlayer', { roomCode, playerId: player.id })
  }

  const handleReject = (player: {
    id: number
    username: string
    avatarKey: number
  }) => {
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id))
    if (!socket.connected) socket.connect()
    socket.emit('rq_gm:rejectPlayer', { roomCode, playerId: player.id })
  }

  const handleRoleChange = (roles: string[]) => {
    setSelectedRoles(roles)
  }

  const handleRandomizeRoles = () => {
    setLoading(true)
    setTextButton('Waiting for players choose role')
    socket.emit(
      'rq_gm:randomizeRoles',
      {
        roomCode,
        roles: selectedRoles,
      },
      (message: string) => {
        if (message) {
          setLoading(false)
          toast.error(message || 'Failed to randomize roles')
        } else {
          setTextButton('Waiting for players ready')
        }
      },
    )
  }

  // const countPlayer = approvedPlayers.length - 1;
  // const canContinue =
  //   approvedPlayers.length >= 5 &&
  //   approvedPlayers.length === selectedRoles.length;
  const countPlayer = 8
  const canContinue = true

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <button
          className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="text-2xl text-yellow-400 hover:text-yellow-500"
              aria-label="Scan QR"
            >
              <ScanQrCode className="h-6 w-6" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Game QR</DialogTitle>
              <DialogDescription>
                Scan this QR code to join the game
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
                  <span className="text-gray-400">No Room Code</span>
                )}
              </div>
              <div className="mb-4 text-center text-2xl font-bold text-yellow-400">
                {roomCode}
              </div>
              <DialogClose asChild>
                <button
                  className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-200 hover:bg-zinc-700"
                  aria-label="Close QR dialog"
                >
                  Close
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <div className="mb-2 text-base font-semibold tracking-wide">
            APPROVED USER
          </div>
          <div className="mb-6 space-y-2">
            {approvedPlayers.length === 0 ? (
              <div className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-zinc-400">
                No player
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
            PENDING USER
          </div>
          <div className="mb-6 space-y-2">
            {pendingPlayers.length === 0 ? (
              <div className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-zinc-400">
                No player
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
                      aria-label="Approve"
                    >
                      <Check className="h-6 w-6" />
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 text-lg text-red-500 hover:bg-red-600 hover:text-white focus:outline-none active:bg-red-700"
                      onClick={() => {
                        handleReject(player)
                      }}
                      aria-label="Reject"
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
          Tapping CONTINUE will random role for all players.
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
    </main>
  )
}
