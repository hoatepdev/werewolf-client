'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import QRCode from 'react-qr-code'
import { Clipboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { buildJoinRoomUrl, formatRoomCode } from '@/lib/room-code'

const CreateRoomPage = () => {
  const socket = getSocket()
  const router = useRouter()

  const {
    username,
    roomCode,
    avatarKey,
    gmPersistentId,
    setRoomCode,
    setGmReconnectToken,
    setResetGame,
  } = useRoomStore()
  const [origin, setOrigin] = useState('')
  const joinRoomUrl = useMemo(
    () => (roomCode ? buildJoinRoomUrl(roomCode, origin) : ''),
    [origin, roomCode],
  )

  useEffect(() => {
    setResetGame()
    setOrigin(window.location.origin)
  }, [setResetGame])

  useEffect(() => {
    if (!socket.connected) socket.connect()
    socket.emit(
      'rq_gm:createRoom',
      { avatarKey, username, gmPersistentId },
      (data: { roomCode: string; gmReconnectToken?: string }) => {
        setRoomCode(data.roomCode)
        if (data.gmReconnectToken) setGmReconnectToken(data.gmReconnectToken)
      },
    )
  }, [
    avatarKey,
    username,
    gmPersistentId,
    socket,
    setRoomCode,
    setGmReconnectToken,
  ])

  const handleCreateRoom = () => {
    router.push(`/approve-room/${roomCode}`)
  }

  return (
    <MainLayout>
      <PageHeader title="Tạo phòng mới" />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-white">
          Mời người chơi tham gia
        </h1>
        <p className="mb-6 text-center text-base text-gray-400">
          Người chơi quét mã QR này để mở trang tham gia và gửi yêu cầu vào
          phòng
        </p>
        <div className="mb-20 rounded-2xl border-4 border-yellow-400 bg-white p-2">
          <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gray-200">
            {roomCode ? (
              <QRCode
                value={joinRoomUrl}
                // size={180}
                bgColor="#fff"
                fgColor="#000"
                className="rounded-xl"
              />
            ) : (
              <span className="text-gray-400">Đang tạo mã QR...</span>
            )}
          </div>
        </div>
        <div className="mb-2 flex w-full items-center">
          <div className="h-px flex-1 bg-gray-600" />
          <span className="mx-3 text-sm font-semibold tracking-widest text-gray-400">
            MÃ PHÒNG THỦ CÔNG
          </span>
          <div className="h-px flex-1 bg-gray-600" />
        </div>
        <p className="mb-4 text-center text-sm text-gray-400">
          Nếu không quét được QR, người chơi có thể nhập mã phòng này trong ứng
          dụng
        </p>
        <div className="mb-8 flex w-full items-center rounded-xl border-2 border-yellow-400 bg-[#23232a] px-4 py-3">
          <span className="flex-1 truncate font-mono text-lg tracking-[0.35em] text-white">
            {formatRoomCode(roomCode)}
          </span>
          <button
            className="ml-2 text-xl text-yellow-400 hover:text-yellow-500"
            aria-label="Sao chép mã phòng"
          >
            <Clipboard
              className="h-6 w-6 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(roomCode || '')
                toast.success('Đã sao chép mã phòng')
              }}
            />
          </button>
        </div>
      </div>
      <div className="mx-auto mt-auto mb-2 flex w-full max-w-sm flex-col">
        <Button onClick={handleCreateRoom} variant="yellow">
          Vào phòng chờ
        </Button>
      </div>
    </MainLayout>
  )
}

export default CreateRoomPage
