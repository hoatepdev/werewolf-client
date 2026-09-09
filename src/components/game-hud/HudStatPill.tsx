'use client'

import { cn } from '@/lib/utils'

type HudStatPillTone = 'neutral' | 'good' | 'warning' | 'danger'

type HudStatPillProps = {
  label: string
  value: string | number
  tone?: HudStatPillTone
  className?: string
}

const toneClasses: Record<HudStatPillTone, string> = {
  neutral: 'border-zinc-600 bg-zinc-900 text-zinc-200',
  good: 'border-green-400 bg-green-500/10 text-green-200',
  warning: 'border-yellow-400 bg-yellow-400/10 text-yellow-100',
  danger: 'border-red-400 bg-red-500/10 text-red-200',
}

export function HudStatPill({
  label,
  value,
  tone = 'neutral',
  className,
}: HudStatPillProps) {
  return (
    <div
      className={cn(
        'inline-flex min-w-0 items-center gap-2 border-l-2 px-2 py-1 text-xs',
        toneClasses[tone],
        className,
      )}
    >
      <span className="truncate text-zinc-400">{label}</span>
      <span className="font-bold tabular-nums text-white">{value}</span>
    </div>
  )
}
