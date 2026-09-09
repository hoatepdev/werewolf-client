'use client'

import { cn } from '@/lib/utils'
import type { HudVoting } from './GameHud.types'

type HudProgressProps = {
  voting?: HudVoting
  className?: string
}

export function HudProgress({ voting, className }: HudProgressProps) {
  if (!voting || voting.totalVoters <= 0) return null

  const percent = Math.min(
    100,
    Math.max(0, (voting.respondedCount / voting.totalVoters) * 100),
  )

  return (
    <div
      className={cn('min-w-[180px]', className)}
      aria-label={`Đã phản hồi ${voting.respondedCount} trên ${voting.totalVoters}`}
    >
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="text-zinc-400">Bỏ phiếu</span>
        <span className="font-semibold text-zinc-100 tabular-nums">
          {voting.respondedCount}/{voting.totalVoters}
          {voting.hasResponded ? ' · Đã gửi' : ''}
        </span>
      </div>
      <div className="h-1 overflow-hidden bg-zinc-800">
        <div
          className="h-full origin-left bg-yellow-400 transition-transform duration-300"
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
    </div>
  )
}
