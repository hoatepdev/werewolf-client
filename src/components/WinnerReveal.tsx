'use client'

import React, { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { playSound, triggerHaptic } from '@/lib/audio'

type WinnerType = 'villagers' | 'werewolves' | 'tanner'

interface WinnerRevealProps {
  winner: WinnerType
  onComplete: () => void
}

const WINNER_CONFIG: Record<
  WinnerType,
  {
    displayName: string
    emoji: string
    gradient: string
    accentColor: string
    bgGradient: string
    confettiColors: string[]
  }
> = {
  villagers: {
    displayName: 'Dân Làng',
    emoji: '🏘️',
    gradient: 'from-blue-500 via-cyan-400 to-green-500',
    accentColor: 'text-blue-400',
    bgGradient: 'bg-gradient-to-br from-blue-950 via-gray-900 to-green-950',
    confettiColors: ['#3b82f6', '#22c55e', '#06b6d4', '#60a5fa'],
  },
  werewolves: {
    displayName: 'Sói',
    emoji: '🐺',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    accentColor: 'text-red-400',
    bgGradient: 'bg-gradient-to-br from-red-950 via-gray-900 to-orange-950',
    confettiColors: ['#ef4444', '#f97316', '#eab308', '#dc2626'],
  },
  tanner: {
    displayName: 'Chán Đời',
    emoji: '😈',
    gradient: 'from-purple-600 via-pink-500 to-rose-500',
    accentColor: 'text-purple-400',
    bgGradient: 'bg-gradient-to-br from-purple-950 via-gray-900 to-pink-950',
    confettiColors: ['#a855f7', '#ec4899', '#f43f5e', '#8b5cf6'],
  },
}

const WinnerReveal: React.FC<WinnerRevealProps> = ({ winner, onComplete }) => {
  const [phase, setPhase] = useState<'fade-in' | 'card-reveal' | 'celebration' | 'show-details'>('fade-in')
  const [showCard, setShowCard] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showTeamName, setShowTeamName] = useState(false)
  const config = WINNER_CONFIG[winner]

  useEffect(() => {
    // Play victory sound
    playSound('victory' as keyof typeof import('@/lib/audio').SOUND_ENABLED)
    triggerHaptic([200, 100, 200, 100, 200, 100, 500])

    // Phase 1: Fade in background
    const timer1 = setTimeout(() => {
      setPhase('card-reveal')
      setShowCard(true)
    }, 300)

    // Phase 2: Reveal emoji
    const timer2 = setTimeout(() => {
      setShowEmoji(true)
    }, 800)

    // Phase 3: Reveal team name with animation
    const timer3 = setTimeout(() => {
      setShowTeamName(true)
      setPhase('celebration')
    }, 1400)

    // Phase 4: Trigger confetti explosion
    const timer4 = setTimeout(() => {
      triggerConfetti()
    }, 1800)

    // Phase 5: Show full details after celebration
    const timer5 = setTimeout(() => {
      setPhase('show-details')
    }, 3500)

    // Phase 6: Transition to GameEnd screen
    const timer6 = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
    }
  }, [winner, onComplete])

  const triggerConfetti = () => {
    // Multiple confetti bursts for cinematic effect
    const duration = 3000
    const end = Date.now() + duration

    const colors = config.confettiColors

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6, x: 0.5 },
      colors,
      zIndex: 9999,
      scalar: 1.5,
    })

    // Follow-up bursts
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval)
        return
      }

      // Random bursts from different angles
      confetti({
        particleCount: 30,
        angle: Math.random() * 360,
        spread: 55,
        origin: { x: Math.random(), y: Math.random() * 0.5 + 0.3 },
        colors,
        zIndex: 9999,
        scalar: 1.2,
      })
    }, 200)
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${config.bgGradient} transition-opacity duration-500 ${
      phase !== 'fade-in' ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle-bg" />
      </div>

      {/* Main reveal card */}
      <div
        className={`relative z-10 mx-4 max-w-sm transition-all duration-700 ${
          showCard ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* Glowing card container */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900/80 p-8 shadow-2xl backdrop-blur-lg border border-white/10">
          {/* Animated gradient border */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 blur-xl transition-opacity duration-700 ${
            phase === 'celebration' || phase === 'show-details' ? 'opacity-40' : ''
          }`} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* "GAME OVER" subtitle */}
            <div
              className={`mb-4 text-sm font-semibold tracking-widest text-gray-400 transition-all duration-500 delay-100 ${
                showCard ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
              }`}
            >
              TRÒ CHƠI KẾT THÚC
            </div>

            {/* Winner emoji */}
            <div
              className={`mb-4 text-7xl transition-all duration-700 delay-300 ${
                showEmoji ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-180 opacity-0'
              }`}
            >
              {config.emoji}
            </div>

            {/* "WINNER" label */}
            <div
              className={`mb-2 text-xs font-bold tracking-[0.3em] text-gray-500 transition-all duration-500 delay-500 ${
                showTeamName ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
                ĐẠI CHIẾN THẮNG
            </div>

            {/* Team name */}
            <h1
              className={`mb-6 bg-gradient-to-r ${config.gradient} bg-clip-text text-4xl font-black text-transparent transition-all duration-700 delay-700 ${
                showTeamName ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-4 opacity-0'
              }`}
            >
              {config.displayName}
            </h1>

            {/* Victory message */}
            <div
              className={`text-sm text-gray-300 transition-all duration-500 delay-1000 ${
                phase === 'celebration' || phase === 'show-details' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              {winner === 'villagers' && 'Ngôi làng đã bình yên trở lại!'}
              {winner === 'werewolves' && 'Bóng tối đã bao trùm ngôi làng!'}
              {winner === 'tanner' && 'Chán đời đã đạt được ước nguyện!'}
            </div>
          </div>

          {/* Animated corner accents */}
          {(phase === 'celebration' || phase === 'show-details') && (
            <>
              <div className={`absolute -top-2 -left-2 h-4 w-4 rounded-full ${config.accentColor.replace('text', 'bg')} animate-ping`} />
              <div className={`absolute -top-2 -right-2 h-4 w-4 rounded-full ${config.accentColor.replace('text', 'bg')} animate-ping delay-75`} />
              <div className={`absolute -bottom-2 -left-2 h-4 w-4 rounded-full ${config.accentColor.replace('text', 'bg')} animate-ping delay-150`} />
              <div className={`absolute -bottom-2 -right-2 h-4 w-4 rounded-full ${config.accentColor.replace('text', 'bg')} animate-ping delay-300`} />
            </>
          )}
        </div>

        {/* Loading indicator for transition */}
        {phase === 'show-details' && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .particle-bg {
          background-image: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 200px 200px;
          animation: float 20s linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default WinnerReveal
