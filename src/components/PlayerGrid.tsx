'use client'

import React, { useMemo } from 'react'
import { Player } from '@/types/player'
import { Card, CardContent } from '@/components/ui/card'
import { renderAvatar } from '@/helpers'
import { toast } from 'sonner'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { hoverTapVariants, springTransition } from '@/lib/motion'

interface PlayerGridProps {
  players: Player[]
  currentPlayerId?: string
  mode?: 'lobby' | 'room'
  selectedId?: string
  selectedIds?: string[]
  onSelect?: (player: Player | null) => void
  selectableList?: { id: string; username: string }[]
  disabled?: boolean
}

export function PlayerGrid({
  players,
  currentPlayerId,
  mode,
  selectedId,
  selectedIds,
  onSelect,
  selectableList,
  disabled = false,
}: PlayerGridProps) {
  const shouldReduceMotion = useReducedMotion()
  const maxPlayers = 9
  const emptySlots = maxPlayers - players.length

  const truncateName = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.slice(0, maxLength) + '...' : name
  }

  const listPlayer = useMemo(() => {
    return players.map((p) => ({
      ...p,
      isSelectable: !disabled && selectableList?.some((sp) => sp.id === p.id && p.alive),
    }))
  }, [players, selectableList, disabled])

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
      <AnimatePresence>
        {listPlayer.map((player) => {
          const isSelected =
            player.id === selectedId || selectedIds?.includes(player.id)

          return (
            <motion.div
              layout={!shouldReduceMotion}
              key={player.id}
              variants={hoverTapVariants}
              whileHover={
                !shouldReduceMotion && player.isSelectable ? 'hover' : undefined
              }
              whileTap={
                !shouldReduceMotion && player.isSelectable ? 'tap' : undefined
              }
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{
                opacity: mode === 'lobby' || player.alive ? 1 : 0.5,
                scale: 1,
              }}
              exit={
                shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 }
              }
              transition={
                shouldReduceMotion ? { duration: 0 } : springTransition
              }
              style={{ willChange: 'transform' }}
            >
              <button
                type="button"
                aria-label={`${player.username}, ${player.alive === false ? 'đã chết' : 'còn sống'}`}
                aria-pressed={player.isSelectable ? Boolean(isSelected) : undefined}
                aria-disabled={!player.isSelectable}
                className={`relative h-full w-full overflow-hidden rounded-md border p-3 transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px ${
                  mode === 'room' && !player.alive ? 'grayscale' : ''
                } ${
                  isSelected ||
                  (currentPlayerId &&
                    mode === 'lobby' &&
                    player.id === currentPlayerId)
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-zinc-800 bg-zinc-900'
                } ${player.isSelectable ? 'cursor-pointer hover:border-zinc-600' : 'cursor-not-allowed opacity-65'}`}
                onClick={() => {
                  if (!player.isSelectable) {
                    toast.error('Bạn không thể chọn người này')
                    return
                  }
                  onSelect?.(isSelected ? null : player)
                }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-sm text-lg font-bold transition-colors ${
                      isSelected
                        ? 'bg-yellow-400 text-black'
                        : 'bg-zinc-700 text-white'
                    }`}
                  >
                    {renderAvatar(player)}
                  </div>
                  <div className="w-full text-center">
                    <div className="w-full truncate text-sm font-medium text-white">
                      {truncateName(player.username)}
                    </div>
                    {mode === 'room' && !player.alive && (
                      <div className="mt-1 text-xs font-bold tracking-wider text-red-400">
                        Đã chết
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {Array.from({ length: emptySlots }).map((_, index) => (
        <Card
          key={`empty-${index}`}
          className="border-dashed border-zinc-600 bg-zinc-800/50"
        >
          <CardContent className="flex flex-col items-center p-3">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg text-zinc-500">
              ?
            </div>
            <div className="text-center">
              <div className="text-sm text-zinc-500">Trống</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
