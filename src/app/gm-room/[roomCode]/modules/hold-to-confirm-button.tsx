'use client'

import { Button } from '@/components/ui/button'
import { useLongPress } from './use-long-press'

interface HoldToConfirmButtonProps {
  onConfirm: () => void
  label?: string
  holdingLabel?: string
  duration?: number
  disabled?: boolean
  className?: string
}

export function HoldToConfirmButton({
  onConfirm,
  label = 'Giai đoạn tiếp theo',
  holdingLabel = 'Đang giữ...',
  duration = 1500,
  disabled = false,
  className = '',
}: HoldToConfirmButtonProps) {
  const { progress, isPressed, ...touchHandlers } = useLongPress(
    onConfirm,
    duration,
  )

  const circumference = 2 * Math.PI * 20 // r=20, so circumference ≈ 125.66
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <Button
      variant="yellow"
      disabled={disabled}
      className={`relative ${className}`}
      {...touchHandlers}
    >
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="#facc15"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.016s linear',
          }}
        />
      </svg>
      <span className="relative z-10">{isPressed ? holdingLabel : label}</span>
    </Button>
  )
}
