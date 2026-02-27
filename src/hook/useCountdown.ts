'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface CountdownState {
  /** Seconds remaining, floored to integer */
  secondsLeft: number
  /** Total duration in seconds (for progress calculation) */
  totalSeconds: number
  /** 0..1 progress where 1 = full time remaining, 0 = expired */
  progress: number
  /** Whether the countdown has expired */
  isExpired: boolean
  /** Whether a countdown is currently active */
  isActive: boolean
}

export function useCountdown(
  onExpire?: () => void,
): CountdownState & {
  start: (deadline: number, durationMs: number) => void
  stop: () => void
} {
  const [state, setState] = useState<CountdownState>({
    secondsLeft: 0,
    totalSeconds: 0,
    progress: 1,
    isExpired: false,
    isActive: false,
  })

  const deadlineRef = useRef<number>(0)
  const durationRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const tick = useCallback(() => {
    const now = Date.now()
    const remaining = Math.max(0, deadlineRef.current - now)
    const totalMs = durationRef.current
    const secondsLeft = Math.ceil(remaining / 1000)
    const progress = totalMs > 0 ? remaining / totalMs : 0

    setState({
      secondsLeft,
      totalSeconds: Math.ceil(totalMs / 1000),
      progress,
      isExpired: remaining <= 0,
      isActive: remaining > 0,
    })

    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true
      onExpireRef.current?.()
      return // stop the loop
    }

    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [])

  const start = useCallback(
    (deadline: number, durationMs: number) => {
      cancelAnimationFrame(rafRef.current)
      deadlineRef.current = deadline
      durationRef.current = durationMs
      expiredRef.current = false
      tick()
    },
    [tick],
  )

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setState((prev) => ({ ...prev, isActive: false, isExpired: false }))
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return { ...state, start, stop }
}
