'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CornerUpLeft, Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'
import { Html5Qrcode } from 'html5-qrcode'
import QRCode from 'react-qr-code'

export default function JoinRoomPage() {
  const socket = getSocket()
  const router = useRouter()

  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const focusRef = useRef<HTMLInputElement>(null)

  const username = useRoomStore((s) => s.username)
  const setRoomCodeStore = useRoomStore((s) => s.setRoomCode)
  const setPlayerId = useRoomStore((s) => s.setPlayerId)
  const avatarKey = useRoomStore((s) => s.avatarKey)
  const [roomCode, setRoomCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    // Request camera permission on mount
    if (typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'camera' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            setScanning(true)
          } else if (result.state === 'prompt') {
            // Try to access camera to trigger prompt
            navigator.mediaDevices
              .getUserMedia({ video: true })
              .then(() => setScanning(true))
              .catch(() => {
                setScanError('Camera access denied or not available.')
                setScanning(false)
              })
          } else {
            setScanError('Camera access denied or not available.')
            setScanning(false)
          }
        })
        .catch(() => {
          setScanError('Camera permission check failed.')
          setScanning(false)
        })
    } else {
      // Fallback: try to access camera directly
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(() => setScanning(true))
          .catch(() => {
            setScanError('Camera access denied or not available.')
            setScanning(false)
          })
      } else {
        setScanError('Camera not supported on this device.')
        setScanning(false)
      }
    }
    focusRef.current?.focus()
  }, [])

  useEffect(() => {
    if (scanning && scannerRef.current && typeof window !== 'undefined') {
      setScanError(null)
      const qrRegionId = 'qr-scanner'
      const qrCode = new Html5Qrcode(qrRegionId)
      html5QrCodeRef.current = qrCode
      qrCode
        .start(
          { facingMode: 'user' },
          {
            fps: 10,
            aspectRatio: 1.0,
            disableFlip: false,
            // videoContainer: scannerRef.current,
          },
          (decodedText: string) => {
            setScanning(false)
            setRoomCode(decodedText)
            // qrCode.stop().then(() => qrCode.clear());
            html5QrCodeRef.current
              ?.stop()
              .then(() => html5QrCodeRef.current?.clear())
            html5QrCodeRef.current = null
          },
          () => {
            // Ignore per-frame scan errors; do not set scanError or stop scanning
          },
        )
        .catch(() => {
          setScanError('Camera access denied or not available.')
          setScanning(false)
        })
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
        html5QrCodeRef.current = null
      }
    }
  }, [scanning])

  useEffect(() => {
    // Listen for approval event
    const handleRoomApproved = (data: { roomCode: string }) => {
      setLoading(false)
      router.push(`/lobby/${data.roomCode}`)
    }
    const handleRoomRejected = (data: { message?: string }) => {
      setLoading(false)
      toast.error(data.message || 'Your request to join was rejected.')
      setRoomCode('')
    }
    socket.on('player:approved', handleRoomApproved)
    socket.on('player:rejected', handleRoomRejected)
    return () => {
      socket.off('player:approved', handleRoomApproved)
      socket.off('player:rejected', handleRoomRejected)
    }
  }, [scanning, router])

  const handleJoinRoom = async () => {
    if (!roomCode || !username) {
      toast.error('Please enter a room code and username')
      return
    }
    setLoading(true)
    if (!socket.connected) socket.connect()
    socket.emit(
      'rq_player:joinRoom',
      { roomCode, avatarKey, username },
      (response: { success: boolean; playerId?: string; message?: string }) => {
        if (response.success && response.playerId) {
          setPlayerId(response.playerId)
          setRoomCodeStore(roomCode)
          toast.success('Request sent! Waiting for approval...')
        } else {
          setLoading(false)
          toast.error(response.message || 'Failed to join room')
        }
      },
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-zinc-900 px-4 py-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <button
          className="mr-2 text-2xl hover:text-gray-400 active:text-gray-500"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <CornerUpLeft className="h-6 w-6 text-gray-400" />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center p-6">
          {scanning && (
            <div
              ref={scannerRef}
              id="qr-scanner"
              className="absolute inset-0 z-20 h-full w-full overflow-hidden rounded-2xl border-none"
            />
          )}
          {scanError && (
            <div className="bg-opacity-70 absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black">
              <span className="text-center text-red-400">{scanError}</span>
            </div>
          )}
          {!scanning && !scanError && roomCode && (
            <QRCode
              value={roomCode}
              //   size={180}
              bgColor="#fff"
              fgColor="#000"
              className="rounded-xl"
            />
          )}
          <div className="absolute top-0 left-0 h-7 w-7 rounded-tl-2xl border-t-4 border-l-4 border-yellow-400" />
          <div className="absolute top-0 right-0 h-7 w-7 rounded-tr-2xl border-t-4 border-r-4 border-yellow-400" />
          <div className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-2xl border-b-4 border-l-4 border-yellow-400" />
          <div className="absolute right-0 bottom-0 h-7 w-7 rounded-br-2xl border-r-4 border-b-4 border-yellow-400" />
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-3"></div>
        </div>
        <div className="mt-8 mb-16 w-full text-center">
          <p className="text-base font-medium text-zinc-400">
            Scan a code to request to join a game
          </p>
        </div>
        <Input
          className="mx-auto h-16 max-w-xs border-none bg-zinc-800 text-lg text-white focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Or enter game code"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value)
          }}
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
              <span>Waiting for approval</span>
            </div>
          ) : (
            <div>Request to join</div>
          )}
        </Button>
      </div>
    </main>
  )
}
