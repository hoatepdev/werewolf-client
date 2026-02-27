'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { CountdownState } from '@/hook/useCountdown'

interface CountdownTimerProps {
  countdown: CountdownState
  /** Size in pixels, defaults to 64 */
  size?: number
  /** Whether to show the text label */
  showLabel?: boolean
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  countdown,
  size = 48,
  showLabel = false,
}) => {
  const { secondsLeft, progress, isActive, isExpired } = countdown

  if (!isActive && !isExpired) return null

  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  // Color transitions: green > 60%, yellow 30-60%, red < 30%
  const getColor = () => {
    if (progress > 0.6) return '#22c55e' // green-500
    if (progress > 0.3) return '#facc15' // yellow-400 (accent)
    return '#ef4444' // red-500
  }

  const isUrgent = secondsLeft <= 10

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={isUrgent && isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={
          isUrgent ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } : {}
        }
      >
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={4}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: getColor() }}
          >
            {secondsLeft}
          </span>
        </div>
      </motion.div>
      {showLabel && (
        <span className="text-xs text-zinc-400">
          {isExpired ? 'Hết giờ' : 'Thời gian'}
        </span>
      )}
    </div>
  )
}

export default CountdownTimer
