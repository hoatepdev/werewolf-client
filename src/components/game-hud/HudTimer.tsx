'use client'

import CountdownTimer from '@/components/CountdownTimer'
import { cn } from '@/lib/utils'
import { getTimerContextLabel } from './GameHud.helpers'
import type { HudTimer as HudTimerState, TimerVisibility } from './GameHud.types'

type HudTimerProps = {
  timer: HudTimerState | null | undefined
  visibility: TimerVisibility
  className?: string
}

export function HudTimer({ timer, visibility, className }: HudTimerProps) {
  if (!timer || !timer.timerContext || (!timer.isActive && !timer.isExpired)) {
    return null
  }

  const label = getTimerContextLabel(timer.timerContext, visibility)

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-950/70 px-3 py-2',
        className,
      )}
      aria-label={`${label ?? 'Đang tính giờ'}: còn ${timer.secondsLeft} giây`}
    >
      <CountdownTimer countdown={timer} size={44} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-zinc-300">
          {label ?? 'Đang tính giờ'}
        </p>
        <p className="text-sm font-bold text-white tabular-nums">
          {timer.isExpired ? 'Hết giờ' : `Còn ${timer.secondsLeft}s`}
        </p>
      </div>
    </div>
  )
}
