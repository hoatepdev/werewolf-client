'use client'

import React, { useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/hook/useRoomStore'
import QRCode from 'react-qr-code'
import { Clipboard, CornerUpLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const CreateRoomPage = () => {
  const socket = getSocket()
  const router = useRouter()

  const { username, roomCode, avatarKey, setRoomCode, setResetGame } =
    useRoomStore()

  console.log(
    '⭐ s',
    useRoomStore((s) => s),
  )

  useEffect(() => {
    setResetGame()
  }, [])

  useEffect(() => {
    if (!socket.connected) socket.connect()
    socket.emit(
      'rq_gm:createRoom',
      { avatarKey, username },
      (data: { roomCode: string }) => {
        setRoomCode(data.roomCode)
      },
    )
  }, [avatarKey, username, socket])

  const handleCreateRoom = () => {
    router.push('/approve-room')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex h-10 w-full items-center justify-between">
        <button
          className="mr-2 text-2xl text-white hover:text-gray-400"
          aria-label="Quay lại"
          onClick={() => router.back()}
        >
          {/* Back arrow icon placeholder */}
          <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
        </button>
        <h1 className="ml-2 text-xl font-bold">Tạo phòng mới</h1>
      </div>

      {/* Main content */}
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-white">
          Tham gia game
        </h1>
        <p className="mb-6 text-center text-base text-gray-400">
          Người chơi cần quét mã QR này bằng thiết bị của họ để yêu cầu tham gia
          game
        </p>
        {/* QR code placeholder with yellow border */}
        <div className="mb-20 rounded-2xl border-4 border-yellow-400 bg-white p-2">
          <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gray-200">
            {roomCode ? (
              <QRCode
                value={roomCode}
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
        {/* Divider with REQUEST MANUALLY */}
        <div className="mb-2 flex w-full items-center">
          <div className="h-px flex-1 bg-gray-600" />
          <span className="mx-3 text-sm font-semibold tracking-widest text-gray-400">
            YÊU CẦU THỦ CÔNG
          </span>
          <div className="h-px flex-1 bg-gray-600" />
        </div>
        <p className="mb-4 text-center text-sm text-gray-400">
          Người chơi cũng có thể sao chép và dán mã game sau đây vào hộp yêu cầu
          tham gia game trong ứng dụng của họ
        </p>
        <div className="mb-8 flex w-full items-center rounded-xl border-2 border-yellow-400 bg-[#23232a] px-4 py-3">
          <span className="flex-1 truncate font-mono text-lg text-white">
            {roomCode}
          </span>
          <button
            className="ml-2 text-xl text-yellow-400 hover:text-yellow-500"
            aria-label="Copy room code"
          >
            <Clipboard
              className="h-6 w-6 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(roomCode || '')
                toast.success('Đã sao chép vào clipboard')
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
    </main>
  )
}

export default CreateRoomPage
