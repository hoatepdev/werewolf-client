'use client'
import { renderAvatar } from '@/helpers'
import { useRouter } from 'next/navigation'
import { useRoomStore } from '@/hook/useRoomStore'
import React from 'react'
import { confirmDialog } from '@/components/ui/alert-dialog'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'

export default function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ roomCode: string }>
}) {
  const router = useRouter()
  const { roomCode } = React.use(params)
  const {
    username,
    avatarKey,
    playerId,
    role,
    phase,
    alive,
  } = useRoomStore()

  const handleLeaveRoom = async () => {
    const confirmed = await confirmDialog({
      title: 'Rời phòng',
      description: 'Bạn có chắc chắn muốn rời phòng?',
      confirmText: 'Rời đi',
      cancelText: 'Hủy',
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
              <span className="max-w-[80px] truncate text-sm font-semibold text-white">
                {username}
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-bold"
                    aria-label="Thông tin người dùng"
                  >
                    <span className="text-2xl">
                      {renderAvatar({ username, avatarKey })}
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[320px] p-5">
                  <DialogTitle className="sr-only">Thông tin người dùng</DialogTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-2xl font-bold">
                      {renderAvatar({ username, avatarKey })}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold">
                        {username || 'Người chơi'}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Phòng: {roomCode}
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
                      <div className="text-zinc-400">Vai trò</div>
                      <div className="text-white">{role || '—'}</div>
                    </div>
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Giai đoạn</div>
                      <div className="text-white">{phase}</div>
                    </div>
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Còn sống</div>
                      <div className="text-white">
                        {alive === null ? '—' : alive ? 'Có' : 'Không'}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />
      <div className="relative flex h-[calc(100vh-80px)] w-full flex-1 flex-col items-center overflow-hidden">
        {children}
      </div>
    </MainLayout>
  )
}
