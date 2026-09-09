'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { playSound, triggerHaptic } from '@/lib/audio'
import { useRoomStore } from '@/hook/useRoomStore'

type WinnerType = 'villagers' | 'werewolves' | 'tanner'

const getPlayerTeam = (role?: string | null): WinnerType | null => {
  if (!role) return null
  if (['villager', 'seer', 'witch', 'hunter', 'bodyguard', 'cupid'].includes(role)) {
    return 'villagers'
  }
  if (role === 'werewolf') return 'werewolves'
  if (role === 'tanner') return 'tanner'
  return null
}

interface WinnerRevealProps {
  winner: WinnerType
  onComplete: () => void
}

const WINNER_CONFIG: Record<
  WinnerType,
  {
    displayName: string
    emoji: string
    borderClass: string
    textClass: string
    message: string
    confettiColors: string[]
  }
> = {
  villagers: {
    displayName: 'Dân Làng',
    emoji: '🏘️',
    borderClass: 'border-emerald-400',
    textClass: 'text-emerald-300',
    message: 'Ngôi làng đã bình yên trở lại.',
    confettiColors: ['#3b82f6', '#22c55e', '#06b6d4', '#60a5fa'],
  },
  werewolves: {
    displayName: 'Sói',
    emoji: '🐺',
    borderClass: 'border-red-400',
    textClass: 'text-red-300',
    message: 'Bóng tối đã bao trùm ngôi làng.',
    confettiColors: ['#ef4444', '#f97316', '#eab308', '#dc2626'],
  },
  tanner: {
    displayName: 'Chán Đời',
    emoji: '😈',
    borderClass: 'border-yellow-400',
    textClass: 'text-yellow-300',
    message: 'Chán đời đã đạt được ước nguyện.',
    confettiColors: ['#facc15', '#f59e0b', '#fb7185', '#eab308'],
  },
}

const WinnerReveal: React.FC<WinnerRevealProps> = ({ winner, onComplete }) => {
  const shouldReduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const config = WINNER_CONFIG[winner]
  const role = useRoomStore((state) => state.role)
  const isWinner = getPlayerTeam(role) === winner

  const triggerConfetti = useCallback(() => {
    if (!isWinner || shouldReduceMotion) return

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.65, x: 0.5 },
      colors: config.confettiColors,
      zIndex: 60,
      scalar: 1.2,
    })
  }, [config.confettiColors, isWinner, shouldReduceMotion])

  useEffect(() => {
    playSound('victory' as keyof typeof import('@/lib/audio').SOUND_ENABLED)
    triggerHaptic([200, 100, 200, 100, 200, 100, 500])

    if (shouldReduceMotion) {
      setVisible(true)
      const timer = setTimeout(onComplete, 1500)
      return () => clearTimeout(timer)
    }

    const revealTimer = setTimeout(() => setVisible(true), 150)
    const confettiTimer = setTimeout(triggerConfetti, 700)
    const completeTimer = setTimeout(onComplete, 5000)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(confettiTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, shouldReduceMotion, triggerConfetti, winner])

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950 px-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <section
        className={`w-full max-w-sm border-l-4 ${config.borderClass} bg-zinc-900 px-6 py-8 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-3'}`}
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
          Trò chơi kết thúc
        </p>
        <div className="mt-6 text-5xl" aria-hidden="true">
          {config.emoji}
        </div>
        <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-zinc-400 uppercase">
          Phe chiến thắng
        </p>
        <h1 className={`mt-2 text-4xl font-black tracking-tight ${config.textClass}`}>
          {config.displayName}
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-300">{config.message}</p>
      </section>
    </div>
  )
}

export default WinnerReveal
