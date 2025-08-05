'use client'

import { useFCM } from '../hook/useFCM'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Bell, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export const FCMNotification = () => {
  const { token, permission, requestPermission } = useFCM()
  const [copied, setCopied] = useState(false)

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      console.log('Notification permission granted')
    } else {
      console.log('Notification permission denied')
    }
  }

  const copyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (permission === 'denied') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications Disabled
          </CardTitle>
          <CardDescription>
            Please enable notifications in your browser settings to receive
            updates.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Enable notifications to receive real-time updates about your game.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <Button onClick={handleRequestPermission} className="w-full">
            Enable Notifications
          </Button>
        )}

        {permission === 'granted' && token && (
          <div className="space-y-2">
            <p className="text-sm font-medium">FCM Token:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-100 p-2 text-xs break-all">
                {token}
              </code>
              <Button variant="black" onClick={copyToken} className="shrink-0">
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
