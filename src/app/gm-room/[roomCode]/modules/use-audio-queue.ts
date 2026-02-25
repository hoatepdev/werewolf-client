import { useCallback, useEffect, useRef, useState } from 'react'
import type { AudioEvent, AudioStatus } from './types'

const MAX_RETRIES = 2
const WATCHDOG_TIMEOUT = 30000

export function useAudioQueue() {
  const isPlayingRef = useRef(false)
  const [currentAudio, setCurrentAudio] = useState<AudioEvent | null>(null)
  const [audioQueue, setAudioQueue] = useState<AudioEvent[]>([])
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle')
  const retryCountRef = useRef(0)
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addToQueue = useCallback((audioEvent: AudioEvent) => {
    setCurrentAudio(audioEvent)
    setAudioQueue((prev) => [...prev, audioEvent])
  }, [])

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  const moveToNext = useCallback(() => {
    clearWatchdog()
    retryCountRef.current = 0
    isPlayingRef.current = false
    setAudioStatus('idle')
    setAudioQueue((prev) => {
      const next = prev.slice(1)
      setCurrentAudio(next[0] || null)
      return next
    })
  }, [clearWatchdog])

  const processQueue = useCallback(() => {
    if (isPlayingRef.current || audioQueue.length === 0) return
    isPlayingRef.current = true
    setAudioStatus('speaking')
    const message = audioQueue[0].message

    if ('speechSynthesis' in window) {
      // Cancel any stuck utterances
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'vi-VN'
      utterance.rate = 1.2
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        setTimeout(moveToNext, 1000)
      }

      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error)

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++
          setAudioStatus('error')
          // Retry after a short delay
          setTimeout(() => {
            isPlayingRef.current = false
            processQueue()
          }, 500)
        } else {
          // Give up on this item, move to next
          setTimeout(moveToNext, 1000)
        }
      }

      // Watchdog: if utterance doesn't finish in 30s, force move on
      clearWatchdog()
      watchdogRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          speechSynthesis.cancel()
          console.warn('Speech watchdog triggered, forcing next')
          moveToNext()
        }
      }, WATCHDOG_TIMEOUT)

      speechSynthesis.speak(utterance)
    } else {
      // No speech synthesis: show text visually for 3s then auto-advance
      setAudioStatus('error')
      setTimeout(moveToNext, 3000)
    }
  }, [audioQueue, moveToNext, clearWatchdog])

  useEffect(() => {
    if (!isPlayingRef.current && audioQueue.length > 0) {
      processQueue()
    }
  }, [audioQueue, processQueue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearWatchdog()
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
    }
  }, [clearWatchdog])

  return {
    addToQueue,
    audioQueue,
    currentAudio,
    isPlayingRef,
    audioStatus,
    setCurrentAudio,
    setAudioQueue,
  }
}
