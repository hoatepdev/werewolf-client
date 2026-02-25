'use client'
import { renderAvatar } from '@/helpers'
import { useRouter } from 'next/navigation'
import { useRoomStore } from '@/hook/useRoomStore'
import React, { useState } from 'react'
import { confirmDialog } from '@/components/ui/alert-dialog'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { Player } from '@/types/player'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSocket } from '@/lib/socket'
import { players } from '@/mock/init-player'

export default function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ roomCode: string }>
}) {
  const router = useRouter()
  const { roomCode } = React.use(params)
  const socket = getSocket()
  const {
    username,
    avatarKey,
    playerId,
    role,
    phase,
    alive,
    setApprovedPlayers,
    setPlayerId,
    setRole,
    setPhase,
    setAlive,
    setStateRoomStore,
  } = useRoomStore()

  const [selectedUser, setSelectedUser] = useState('')

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Leave Room',
      description: 'Are you sure you want to leave the room?',
      confirmText: 'Leave',
      cancelText: 'Cancel',
    })
    if (!confirmed) return

    router.push('/join-room')
  }
  const seedMockGame = () => {
    const { id, username, avatarKey, role } =
      players.find((player) => player.id === selectedUser) || players[0]

    setStateRoomStore({
      alive: true,
      approvedPlayers: players,
      avatarKey: avatarKey,
      hunterDeathShooting: false,
      nightPrompt: null,
      nightResult: null,
      phase: 'night',
      playerId: id,
      rehydrated: true,
      role: role,
      roomCode: roomCode,
      socket: getSocket(),
      username: username,
    })
  }

  return (
    <MainLayout>
      <PageHeader
        title={roomCode}
        onBack={handleLeaveRoom}
        right={
          <div className="flex min-w-[120px] items-center justify-end gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="max-w-[80px] truncate text-sm font-semibold text-white">
                {username}
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-bold"
                    aria-label="User info"
                  >
                    <span className="text-2xl">
                      {renderAvatar({ username, avatarKey })}
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[320px] p-5">
                  <DialogTitle className="sr-only">User info</DialogTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-2xl font-bold">
                      {renderAvatar({ username, avatarKey })}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold">
                        {username || 'Player'}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Room: {roomCode}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">ID</div>
                      <div className="truncate text-white">
                        {playerId || '—'}
                      </div>
                    </div>
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Role</div>
                      <div className="text-white">{role || '—'}</div>
                    </div>
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Phase</div>
                      <div className="text-white">{phase}</div>
                    </div>
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Alive</div>
                      <div className="text-white">
                        {alive === null ? '—' : alive ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedUser}
                        onValueChange={setSelectedUser}
                      >
                        <SelectTrigger className="w-[180px] text-sm font-bold text-white">
                          <SelectValue placeholder="Select a player" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Players</SelectLabel>
                            {players.map((player) => (
                              <SelectItem
                                key={player.id}
                                value={player.id}
                                className="text-sm font-bold"
                              >
                                {player.username}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <button
                        className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-bold text-white"
                        disabled={!selectedUser}
                        onClick={seedMockGame}
                      >
                        Mock
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />
      <div className="flex h-[calc(100vh-80px)] w-full flex-1 flex-col items-center">
        {children}
      </div>
    </MainLayout>
  )
}
