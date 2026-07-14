'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CircleX, Loader2Icon, ScanQrCode, X, SwitchCamera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import { getSocket } from '@/lib/socket'
import { parseRoomCodeInput } from '@/lib/room-code'
import { toast } from 'sonner'
import { Html5Qrcode } from 'html5-qrcode'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'

export default function JoinRoomPage() {
  const socket = getSocket()
  const router = useRouter()

  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const focusRef = useRef<HTMLInputElement>(null)

  const {
    username,
    avatarKey,
    setPlayerId,
    setRoomCode: setRoomCodeStore,
    setResetGame,
    persistentPlayerId,
    setReconnectToken,
  } = useRoomStore()

  const [roomCode, setRoomCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>(
    'environment',
  )

  const stopScanner = useCallback(() => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => html5QrCodeRef.current?.clear())
        .catch(() => html5QrCodeRef.current?.clear())
      html5QrCodeRef.current = null
    }
  }, [])

  useEffect(() => {
    setResetGame()
    focusRef.current?.focus()

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const codeFromUrl = params.get('roomCode')
      if (codeFromUrl) {
        setRoomCode(parseRoomCodeInput(codeFromUrl))
      } else {
        setScanning(true)
      }
    }

    return () => stopScanner()
  }, [setResetGame, stopScanner])

  useEffect(() => {
    if (!scanning || !scannerRef.current || typeof window === 'undefined')
      return

    setScanError(null)
    setScanSuccess(false)
    const qrRegionId = 'qr-scanner'
    const qrCode = new Html5Qrcode(qrRegionId)
    html5QrCodeRef.current = qrCode

    qrCode
      .start(
        { facingMode: cameraFacing },
        {
          fps: 10,
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText: string) => {
          const parsedRoomCode = parseRoomCodeInput(decodedText)
          if (!parsedRoomCode) {
            setScanError('Mã QR không chứa mã phòng hợp lệ.')
            return
          }
          setRoomCode(parsedRoomCode)
          setScanSuccess(true)
          setScanning(false)
          stopScanner()
          toast.success(`Đã quét mã phòng ${parsedRoomCode}`)
        },
        () => {},
      )
      .catch(() => {
        setScanError('Không thể mở camera. Bạn có thể nhập mã phòng thủ công.')
        setScanning(false)
      })

    return () => stopScanner()
  }, [cameraFacing, scanning, stopScanner])

  useEffect(() => {
    const handleRoomApproved = (data: { roomCode: string }) => {
      setLoading(false)
      router.push(`/lobby/${data.roomCode}`)
    }
    const handleRoomRejected = (data: { message?: string }) => {
      setLoading(false)
      toast.error(data.message || 'Yêu cầu tham gia của bạn bị từ chối.')
      setRoomCode('')
    }
    socket.on('player:approved', handleRoomApproved)
    socket.on('player:rejected', handleRoomRejected)
    return () => {
      socket.off('player:approved', handleRoomApproved)
      socket.off('player:rejected', handleRoomRejected)
    }
  }, [router, socket])

  const startScanning = () => {
    setScanError(null)
    setScanSuccess(false)
    setScanning(true)
  }

  const handleSwitchCamera = () => {
    setScanError(null)
    setCameraFacing((current) =>
      current === 'environment' ? 'user' : 'environment',
    )
    setScanning(true)
  }

  const handleRoomCodeChange = (value: string) => {
    setRoomCode(parseRoomCodeInput(value))
    setScanSuccess(false)
  }

  const handleJoinRoom = async () => {
    const normalizedRoomCode = parseRoomCodeInput(roomCode)
    if (!normalizedRoomCode || !username) {
      toast.error('Vui lòng nhập mã phòng và tên người dùng')
      return
    }
    setLoading(true)

    if (!socket.connected) socket.connect()
    socket.emit(
      'rq_player:joinRoom',
      { roomCode: normalizedRoomCode, avatarKey, username, persistentPlayerId },
      (response: {
        success: boolean
        playerId?: string
        reconnectToken?: string
        message?: string
      }) => {
        if (response.success && response.playerId) {
          setPlayerId(response.playerId)
          if (response.reconnectToken)
            setReconnectToken(response.reconnectToken)
          setRoomCodeStore(normalizedRoomCode)
          toast.success('Đã gửi yêu cầu! Đang chờ GM duyệt...')
        } else {
          setLoading(false)
          toast.error(response.message || 'Không thể tham gia phòng')
        }
      },
    )
  }

  return (
    <MainLayout>
      <PageHeader title="Tham gia phòng" />
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center p-6">
          {scanning ? (
            <div
              ref={scannerRef}
              id="qr-scanner"
              className="absolute inset-0 z-20 h-full w-full overflow-hidden rounded-2xl border-none"
            />
          ) : (
            <div className="absolute inset-6 flex flex-col items-center justify-center rounded-2xl bg-zinc-900 text-center">
              <ScanQrCode className="mb-4 h-16 w-16 text-yellow-400" />
              <p className="px-4 text-sm text-zinc-300">
                Quét QR từ màn hình của quản trò để nhập mã phòng nhanh hơn.
              </p>
            </div>
          )}
          {scanError && (
            <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black/80 p-4">
              <span className="text-center text-red-400">{scanError}</span>
            </div>
          )}
          <div className="absolute top-0 left-0 h-7 w-7 rounded-tl-2xl border-t-4 border-l-4 border-yellow-400" />
          <div className="absolute top-0 right-0 h-7 w-7 rounded-tr-2xl border-t-4 border-r-4 border-yellow-400" />
          <div className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-2xl border-b-4 border-l-4 border-yellow-400" />
          <div className="absolute right-0 bottom-0 h-7 w-7 rounded-br-2xl border-r-4 border-b-4 border-yellow-400" />
        </div>

        <div className="mt-8 mb-12 flex w-full max-w-xs flex-col gap-3 text-center">
          {scanSuccess && roomCode && (
            <div className="rounded-xl border border-green-500/40 bg-green-950/40 px-4 py-3 text-sm text-green-300">
              Đã quét mã phòng <span className="font-bold">{roomCode}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <Button
              // variant="secondary"
              type="button"
              onClick={
                scanning
                  ? () => {
                      setScanning(false)
                      stopScanner()
                    }
                  : startScanning
              }
              className="w-full"
            >
              {scanning ? (
                <div className="flex items-center justify-center gap-2">
                  <CircleX className="h-8 w-8" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ScanQrCode className="h-8 w-8" />
                </div>
              )}
            </Button>
            <Button
              variant="yellow"
              type="button"
              onClick={handleSwitchCamera}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <SwitchCamera className="h-8 w-8" />
              </div>
            </Button>
          </div>
        </div>
        <p className="mb-2 text-sm text-zinc-400">
          Hoặc nhập mã phòng thủ công
        </p>
        <Input
          className="mx-auto h-16 max-w-xs border-none bg-zinc-800 text-lg text-white focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Nhập mã phòng"
          value={roomCode}
          onChange={(e) => handleRoomCodeChange(e.target.value)}
          ref={focusRef}
        />
      </div>
      <div className="mx-auto mt-auto mb-2 flex w-full max-w-sm flex-col">
        <Button
          variant="yellow"
          className="w-full"
          type="button"
          disabled={!roomCode || loading}
          onClick={handleJoinRoom}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" />
              <span>Đang chờ GM duyệt</span>
            </div>
          ) : (
            <div>Yêu cầu tham gia</div>
          )}
        </Button>
      </div>
    </MainLayout>
  )
}
