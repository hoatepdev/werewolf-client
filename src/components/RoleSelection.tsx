'use client'

import React, { useMemo, useState } from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Minus } from 'lucide-react'
import { LIST_ROLE } from '@/constants/role'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/role'
import {
  countSelectedRoles,
  flattenRoleCounts,
  normalizeRoleCounts,
  type RoleCounts,
} from '@/lib/role-presets'

interface RoleSelectionProps {
  value?: RoleCounts
  onCountsChange?: (counts: RoleCounts) => void
  onChange?: (roles: Role[]) => void
  totalCount: number
  disabled?: boolean
  showSummary?: boolean
}

export function RoleSelection({
  value,
  onCountsChange,
  onChange,
  totalCount,
  disabled = false,
  showSummary = true,
}: RoleSelectionProps) {
  const [internalCounts, setInternalCounts] = useState<RoleCounts>({})
  const roleCounts = useMemo(
    () => normalizeRoleCounts(value ?? internalCounts),
    [internalCounts, value],
  )
  const selectedCount = countSelectedRoles(roleCounts)

  const updateCounts = (nextCounts: RoleCounts) => {
    const normalizedCounts = normalizeRoleCounts(nextCounts)

    if (!value) {
      setInternalCounts(normalizedCounts)
    }

    onCountsChange?.(normalizedCounts)
    onChange?.(flattenRoleCounts(normalizedCounts))
  }

  const handleRoleIncrement = (roleId: Role) => {
    if (disabled || selectedCount >= totalCount) return

    updateCounts({
      ...roleCounts,
      [roleId]: (roleCounts[roleId] ?? 0) + 1,
    })
  }

  const handleRoleDecrement = (roleId: Role) => {
    if (disabled) return

    const currentCount = roleCounts[roleId] ?? 0
    if (currentCount <= 0) return

    const newCounts = { ...roleCounts, [roleId]: currentCount - 1 }
    if (newCounts[roleId] === 0) {
      delete newCounts[roleId]
    }

    updateCounts(newCounts)
  }

  return (
    <div className={cn('w-full', showSummary && 'mb-16')}>
      {showSummary && (
        <div className="mb-4">
          <h3 className="mb-2 text-base font-semibold tracking-wide">
            CHỌN VAI TRÒ
          </h3>
          <p className="text-sm text-zinc-400">
            {selectedCount}/{totalCount} vai trò đã chọn
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {LIST_ROLE.map((role) => {
          const count = roleCounts[role.id] ?? 0
          const isMaxReached = selectedCount >= totalCount
          const canIncrement = !disabled && !isMaxReached
          const canDecrement = !disabled && count > 0

          return (
            <Card
              key={role.id}
              className={cn(
                'transition-all duration-200 hover:border-zinc-600',
                disabled ? 'opacity-70' : 'cursor-pointer',
                count > 0
                  ? 'border-yellow-400 bg-zinc-700/50'
                  : isMaxReached || disabled
                    ? 'border-zinc-700 bg-zinc-800 opacity-60'
                    : 'border-zinc-700 bg-zinc-800',
              )}
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.emoji}</span>
                    <div>
                      <CardTitle className="text-base font-semibold text-white">
                        {role.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-zinc-400">
                        {role.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRoleDecrement(role.id)
                      }}
                      disabled={!canDecrement}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                        canDecrement
                          ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
                          : 'cursor-not-allowed bg-zinc-700 text-zinc-500',
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-lg font-bold text-white">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRoleIncrement(role.id)
                      }}
                      disabled={!canIncrement}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                        canIncrement
                          ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                          : 'cursor-not-allowed bg-zinc-700 text-zinc-500',
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
