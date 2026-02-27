'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useCountdown, type CountdownState } from './useCountdown'
import { getSocket } from '@/lib/socket'

interface TimerContextValue extends CountdownState {
  timerContext: string | null
}

const TimerContext = createContext<TimerContextValue>({
  secondsLeft: 0,
  totalSeconds: 0,
  progress: 1,
  isExpired: false,
  isActive: false,
  timerContext: null,
})

export function useTimer() {
  return useContext(TimerContext)
}

export function TimerProvider({
  children,
  onExpire,
}: {
  children: React.ReactNode
  onExpire?: (context: string) => void
}) {
  const [timerContext, setTimerContext] = React.useState<string | null>(null)
  const timerContextRef = React.useRef<string | null>(null)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  // Store countdown methods in ref to avoid re-subscribing socket listeners
  const countdownMethodsRef = React.useRef<{
    start: (deadline: number, durationMs: number) => void
    stop: () => void
  } | null>(null)

  const handleExpire = React.useCallback(() => {
    if (timerContextRef.current) {
      onExpireRef.current?.(timerContextRef.current)
    }
  }, [])

  const countdown = useCountdown(handleExpire)

  // Update ref when countdown methods change (they're stable via useCallback)
  countdownMethodsRef.current = {
    start: countdown.start,
    stop: countdown.stop,
  }

  useEffect(() => {
    const socket = getSocket()

    const handleTimerStart = (data: {
      context: string
      durationMs: number
      deadline: number
    }) => {
      setTimerContext(data.context)
      timerContextRef.current = data.context
      countdownMethodsRef.current?.start(data.deadline, data.durationMs)
    }

    const handleTimerStop = () => {
      countdownMethodsRef.current?.stop()
      setTimerContext(null)
      timerContextRef.current = null
    }

    const handleTimerSync = (data: {
      context: string
      durationMs: number
      deadline: number
    }) => {
      // Same as start -- used on reconnect
      handleTimerStart(data)
    }

    socket.on('game:timerStart', handleTimerStart)
    socket.on('game:timerStop', handleTimerStop)
    socket.on('game:timerSync', handleTimerSync)

    return () => {
      socket.off('game:timerStart', handleTimerStart)
      socket.off('game:timerStop', handleTimerStop)
      socket.off('game:timerSync', handleTimerSync)
    }
  }, []) // Empty deps - socket listeners should only be registered once

  return (
    <TimerContext.Provider value={{ ...countdown, timerContext }}>
      {children}
    </TimerContext.Provider>
  )
}
