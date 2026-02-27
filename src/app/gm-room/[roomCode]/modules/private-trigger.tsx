'use client'

import { Lock } from 'lucide-react'
import { useLongPress } from './use-long-press'

interface PrivateTriggerProps {
  onActivate: () => void
}

export function PrivateTrigger({ onActivate }: PrivateTriggerProps) {
  const { progress, isPressed, ...touchHandlers } = useLongPress(
    onActivate,
    500,
  )

  // Explicitly type touchHandlers to ensure isPressed is excluded
  const divHandlers: Pick<
    ReturnType<typeof useLongPress>,
    | 'onTouchStart'
    | 'onTouchEnd'
    | 'onTouchCancel'
    | 'onMouseDown'
    | 'onMouseUp'
    | 'onMouseLeave'
  > = touchHandlers

  return (
    <div
      className="relative mx-auto mt-6 flex w-full max-w-xs items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 px-6 py-3"
      {...divHandlers}
    >
      {/* Radial fill effect */}
      <div
        className="absolute inset-0 bg-yellow-400/20"
        style={{
          transform: `scale(${progress})`,
          transformOrigin: 'center',
          transition: 'transform 0.016s linear',
        }}
      />

      {/* Icon and text */}
      <div className="relative z-10 flex items-center gap-2">
        <Lock
          className={`h-4 w-4 text-zinc-500 ${isPressed ? 'text-yellow-400' : ''}`}
        />
        <span
          className={`text-xs ${isPressed ? 'text-yellow-400' : 'text-zinc-500'}`}
        >
          Chế độ riêng tư
        </span>
      </div>

      {/* Progress indicator ring */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 60"
        fill="none"
      >
        <rect
          x="2"
          y="2"
          width="196"
          height="56"
          rx="28"
          stroke="#facc15"
          strokeWidth="2"
          fill="none"
          strokeDasharray="500"
          strokeDashoffset={500 * (1 - progress)}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.016s linear',
          }}
        />
      </svg>
    </div>
  )
}
