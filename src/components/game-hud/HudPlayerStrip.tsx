'use client'

import { renderAvatar } from '@/helpers'
import { cn } from '@/lib/utils'
import { getRoleDisplay } from './GameHud.helpers'
import type { HudIdentity } from './GameHud.types'

type HudPlayerStripProps = {
  identity: HudIdentity
  className?: string
}

export function HudPlayerStrip({ identity, className }: HudPlayerStripProps) {
  const roleDisplay = getRoleDisplay(identity.role)
  const aliveLabel =
    identity.alive === null || identity.alive === undefined
      ? 'Chưa rõ'
      : identity.alive
        ? 'Còn sống'
        : 'Đã chết'

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-2xl shadow-inner">
        {renderAvatar({
          username: identity.username || 'Người chơi',
          avatarKey: identity.avatarKey,
        })}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-bold text-white">
            {identity.username || 'Người chơi'}
          </p>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              identity.alive === false
                ? 'bg-red-500/15 text-red-200'
                : 'bg-green-500/15 text-green-200',
            )}
          >
            {aliveLabel}
          </span>
        </div>
        <p className="truncate text-xs text-zinc-400">
          {roleDisplay ? `${roleDisplay.emoji} ${roleDisplay.name}` : 'Chưa nhận vai'}
          {identity.loverPartnerName ? ` · 💞 ${identity.loverPartnerName}` : ''}
        </p>
      </div>
    </div>
  )
}
