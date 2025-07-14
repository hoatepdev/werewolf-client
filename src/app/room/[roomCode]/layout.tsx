'use client'
import { CornerUpLeft } from 'lucide-react'
import { renderAvatar } from '@/helpers'
import { useRouter } from 'next/navigation'
import { useRoomStore } from '@/hook/useRoomStore'
import React from 'react'
import { confirmDialog } from '@/components/ui/alert-dialog'
export default function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ roomCode: string }>
}) {
  const router = useRouter()
  const { roomCode } = React.use(params)

  const { username, avatarKey } = useRoomStore()

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
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 text-white">
      <div className="flex h-20 items-center justify-between p-4">
        <div className="flex items-center">
          <button
            className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
            aria-label="Back"
            onClick={handleLeaveRoom}
          >
            <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
          </button>
          <h1 className="text-xl font-bold">{roomCode}</h1>
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
      <div className="flex h-[calc(100vh-80px)] w-full flex-1 flex-col items-center">
        {children}
      </div>
    </main>
  )
}
