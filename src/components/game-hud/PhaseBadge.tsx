'use client'

import { cn } from '@/lib/utils'
import { getPhaseLabel, getPhaseTone } from './GameHud.helpers'
import type { HudPhase } from './GameHud.types'

type PhaseBadgeProps = {
  phase: HudPhase
  className?: string
}

export function PhaseBadge({ phase, className }: PhaseBadgeProps) {
  const tone = getPhaseTone(phase)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1',
        tone.labelClass,
        className,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', tone.dotClass)} />
      {getPhaseLabel(phase)}
    </span>
  )
}
