import { useCallback, useEffect, useState } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getMessagingInstance } from '../lib/firebase'
import { vapidKey } from '../lib/firebase-config'
import { toast } from 'sonner'

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')

  const getFCMToken = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    const messaging = await getMessagingInstance()

    if (!messaging) {
      console.log('Firebase messaging is not supported in this browser')
      return
    }

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
        console.log('FCM Token:', currentToken)
        return currentToken
      } else {
        console.log('No registration token available')
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)

      if (Notification.permission === 'granted') {
        getFCMToken()
      }
    }
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
    requestPermission,
    getFCMToken,
  }
}
