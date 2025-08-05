import { useEffect, useState } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '../lib/firebase'
import { vapidKey } from '../lib/firebase-config'
import { toast } from 'sonner'

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')

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

  const getFCMToken = async () => {
    if (!messaging) {
      console.log('Messaging not supported')
      return
    }

    try {
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
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermission(Notification.permission)

      if (Notification.permission === 'granted') {
        getFCMToken()
      }
    }
  }, [])

  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
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

    return () => unsubscribe()
  }, [])

  return {
    token,
    permission,
    requestPermission,
    getFCMToken,
  }
}
