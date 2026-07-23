'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, CheckCircle2 } from 'lucide-react'
import { useFCM } from '../hook/useFCM'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { toast } from 'sonner'

interface FCMNotificationProps {
  roomCode: string
  participantKind: 'player' | 'gm'
}

export const FCMNotification = ({
  roomCode,
  participantKind,
}: FCMNotificationProps) => {
  const {
    permission,
    isSupported,
    requestPermission,
    registerForRoom,
    unregisterForRoom,
    isRegisteredForRoom,
  } = useFCM()
  const [isRegistering, setIsRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    setRegistered(isRegisteredForRoom(roomCode, participantKind))
  }, [isRegisteredForRoom, participantKind, roomCode])

  useEffect(() => {
    if (permission !== 'granted' || registered || isRegistering) return

    let cancelled = false
    setIsRegistering(true)
    registerForRoom(roomCode, participantKind)
      .then((success) => {
        if (!cancelled) setRegistered(success)
      })
      .finally(() => {
        if (!cancelled) setIsRegistering(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    isRegistering,
    participantKind,
    permission,
    registerForRoom,
    registered,
    roomCode,
  ])

  const handleEnable = async () => {
    setIsRegistering(true)
    try {
      const granted =
        permission === 'granted' ? true : await requestPermission()
      if (!granted) return

      const success = await registerForRoom(roomCode, participantKind)
      setRegistered(success)
    } finally {
      setIsRegistering(false)
    }
  }, [
    isRegistering,
    participantKind,
    permission,
    registerForRoom,
    registered,
    roomCode,
  ])

  const handleEnable = async () => {
    setIsRegistering(true)
    try {
      const granted =
        permission === 'granted' ? true : await requestPermission()
      if (!granted) return

  const handleDisable = async () => {
    setIsRegistering(true)
    try {
      const success = await unregisterForRoom(roomCode, participantKind)
      if (!success) return
      setRegistered(false)
      toast.success('Đã tắt thông báo cho phòng này')
    } finally {
      setIsRegistering(false)
    }
  }

  if (isSupported === false) {
    return (
      <Card className="border-zinc-700/70 bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-zinc-200">
            <BellOff className="h-4 w-4" />
            Thiết bị không hỗ trợ thông báo
          </CardTitle>
          <CardDescription>
            Trình duyệt này chưa hỗ trợ thông báo đẩy cho PWA.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (permission === 'denied') {
    return (
      <Card className="border-red-500/30 bg-red-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-red-200">
            <BellOff className="h-4 w-4" />
            Thông báo đang bị chặn
          </CardTitle>
          <CardDescription className="text-red-100/80">
            Hãy mở cài đặt trình duyệt và cho phép thông báo để không bỏ lỡ lượt
            chơi.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (permission === 'granted' && registered) {
    return (
      <Card className="border-green-500/30 bg-green-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-green-200">
            <CheckCircle2 className="h-4 w-4" />
            Đã bật thông báo
          </CardTitle>
          <CardDescription className="text-green-100/80">
            Game sẽ nhắc bạn khi đến lượt quan trọng trong phòng này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDisable}
            disabled={isRegistering}
            variant="default"
            className="border border-green-400/40 bg-green-950/40 py-2 text-sm text-green-100 hover:bg-green-900/50"
          >
            {isRegistering ? 'Đang tắt...' : 'Tắt thông báo'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-400/30 bg-zinc-900/85">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-yellow-300">
          <Bell className="h-4 w-4" />
          Bật thông báo lượt chơi
        </CardTitle>
        <CardDescription>
          Bật thông báo để không bỏ lỡ lượt chơi khi chuyển app hoặc tắt màn
          hình.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleEnable}
          disabled={isRegistering}
          variant="yellow"
          className="py-2 text-sm"
        >
          {isRegistering ? 'Đang bật...' : 'Bật thông báo'}
        </Button>
      </CardContent>
    </Card>
  )
}
