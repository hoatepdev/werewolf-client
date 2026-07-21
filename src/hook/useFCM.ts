import { useCallback, useEffect, useState } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getMessagingInstance } from '../lib/firebase'
import { vapidKey } from '../lib/firebase-config'
import { toast } from 'sonner'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from './useRoomStore'

const DEVICE_ID_KEY = 'werewolf-push-device-id'

function getDeviceId() {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing
  const next = crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, next)
  return next
}

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const {
    persistentPlayerId,
    reconnectToken,
    gmPersistentId,
    gmReconnectToken,
  } = useRoomStore()

  const getFCMToken = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    const messaging = await getMessagingInstance()

    if (!messaging) {
      setIsSupported(false)
      console.log('Firebase messaging is not supported in this browser')
      return
    }
    setIsSupported(true)

    if (!vapidKey) {
      console.log('Firebase VAPID key is missing')
      return
    }

    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready
      }

      const currentToken = await getToken(messaging, { vapidKey })
      if (currentToken) {
        setToken(currentToken)
        if (process.env.NODE_ENV !== 'production') {
          console.log('FCM Token:', currentToken)
        }
        return currentToken
      } else {
        console.log('No registration token available')
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window) || isSupported === false) {
      console.log('This browser does not support notifications')
      return false
    }

    const permission = await Notification.requestPermission()
    setPermission(permission)

    if (permission === 'granted') {
      await getFCMToken()
      return true
    }

    return false
  }

  const registerForRoom = useCallback(
    async (roomCode: string, participantKind: 'player' | 'gm') => {
      const currentToken = token ?? (await getFCMToken())
      if (!currentToken || !roomCode) return false

      const socket = getSocket()
      if (!socket.connected) socket.connect()

      return new Promise<boolean>((resolve) => {
        socket.emit(
          'push:register',
          {
            roomCode,
            token: currentToken,
            deviceId: getDeviceId(),
            participantKind,
            persistentPlayerId,
            reconnectToken,
            gmPersistentId,
            gmReconnectToken,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
          (ack?: { success: boolean; message?: string }) => {
            if (!ack?.success) {
              toast.error(ack?.message || 'Không thể bật thông báo')
              resolve(false)
              return
            }
            resolve(true)
          },
        )
      })
    },
    [
      getFCMToken,
      gmPersistentId,
      gmReconnectToken,
      persistentPlayerId,
      reconnectToken,
      token,
    ],
  )

  const unregisterForRoom = useCallback(
    async (roomCode: string, participantKind: 'player' | 'gm') => {
      const socket = getSocket()
      if (!socket.connected) socket.connect()
      const currentToken = token ?? undefined

      return new Promise<boolean>((resolve) => {
        socket.emit(
          'push:unregister',
          {
            roomCode,
            token: currentToken,
            deviceId: getDeviceId(),
            participantKind,
          },
          (ack?: { success: boolean; message?: string }) => {
            resolve(ack?.success === true)
          },
        )
      })
    },
    [token],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    getMessagingInstance().then((messaging) => {
      setIsSupported(Boolean(messaging))
      if (messaging && Notification.permission === 'granted') {
        getFCMToken()
      }
    })
  }, [getFCMToken])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let isMounted = true

    getMessagingInstance().then((messaging) => {
      if (!messaging || !isMounted) return

      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload)

        toast(payload.notification?.title || 'New Message', {
          description: payload.notification?.body,
          action: {
            label: 'View',
            onClick: () => {
              if (payload.data?.url) {
                window.open(payload.data.url, '_blank')
              }
            },
          },
        })
      })
    })

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [])

  return {
    token,
    permission,
    isSupported,
    requestPermission,
    getFCMToken,
    registerForRoom,
    unregisterForRoom,
  }
}
