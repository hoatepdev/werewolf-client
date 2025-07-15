'use client'
import { renderAvatar } from '@/helpers'
import { useRouter } from 'next/navigation'
import { useRoomStore } from '@/hook/useRoomStore'
import React from 'react'
import { confirmDialog } from '@/components/ui/alert-dialog'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'

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
    <MainLayout>
      <PageHeader
        title={roomCode}
        onBack={handleLeaveRoom}
        right={
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
        }
      />
      <div className="flex h-[calc(100vh-80px)] w-full flex-1 flex-col items-center">
        {children}
      </div>
    </MainLayout>
  )
}
