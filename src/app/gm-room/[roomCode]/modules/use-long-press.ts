import { useCallback, useRef, useState } from 'react'

interface UseLongPressReturn {
  onTouchStart: () => void
  onTouchEnd: () => void
  onTouchCancel: () => void
  onMouseDown: () => void
  onMouseUp: () => void
  onMouseLeave: () => void
  progress: number
  isPressed: boolean
}

export function useLongPress(
  callback: () => void,
  duration = 800,
): UseLongPressReturn {
  const [progress, setProgress] = useState(0)
  const [isPressed, setIsPressed] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const firedRef = useRef(false)

  const animate = useCallback(() => {
    if (!startTimeRef.current) return
    const elapsed = Date.now() - startTimeRef.current
    const p = Math.min(elapsed / duration, 1)
    setProgress(p)
    if (p >= 1 && !firedRef.current) {
      firedRef.current = true
      callback()
      return
    }
    if (p < 1) {
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [callback, duration])

  const start = useCallback(() => {
    firedRef.current = false
    startTimeRef.current = Date.now()
    setIsPressed(true)
    setProgress(0)
    rafRef.current = requestAnimationFrame(animate)
  }, [animate])

  const stop = useCallback(() => {
    startTimeRef.current = null
    setIsPressed(false)
    setProgress(0)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchCancel: stop,
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    progress,
    isPressed,
  }
}
