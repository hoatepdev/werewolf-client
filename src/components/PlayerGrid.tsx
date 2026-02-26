'use client'

import React, { useMemo } from 'react'
import { Player } from '@/types/player'
import { Card, CardContent } from '@/components/ui/card'
import { renderAvatar } from '@/helpers'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { hoverTapVariants, springTransition } from '@/lib/motion'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'

interface PlayerGridProps {
  players: Player[]
  currentPlayerId?: string
  mode?: 'lobby' | 'room'
  selectedId?: string
  onSelect?: (player: Player | null) => void
  selectableList?: { id: string; username: string }[]
}

export function PlayerGrid({
  players,
  currentPlayerId,
  mode,
  selectedId,
  onSelect,
  selectableList,
}: PlayerGridProps) {
  const maxPlayers = 9
  const emptySlots = maxPlayers - players.length

  const truncateName = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.slice(0, maxLength) + '...' : name
  }

  const listPlayer = useMemo(() => {
    return players.map((p) => ({
      ...p,
      isSelectable: selectableList?.some((sp) => sp.id === p.id && p.alive),
    }))
  }, [players, selectableList])

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
      {listPlayer.map((player) => (
        <motion.div
          layout
          key={player.id}
          variants={hoverTapVariants}
          whileHover={player.isSelectable ? 'hover' : undefined}
          whileTap={player.isSelectable ? 'tap' : undefined}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: mode === 'lobby' || player.alive ? 1 : 0.5,
            scale: 1,
            filter: mode === 'lobby' || player.alive ? 'grayscale(0%)' : 'grayscale(100%)',
          }}
          transition={springTransition}
          style={{ willChange: 'transform' }}
        >
          <Card
            className={`relative h-full w-full overflow-hidden transition-all duration-200 ${
              player.id === selectedId ||
              (currentPlayerId &&
                mode === 'lobby' &&
                player.id === currentPlayerId)
                ? 'bg-zinc-700/50 ring-2 ring-yellow-400'
                : 'bg-zinc-800'
            } ${
              player.isSelectable
                ? 'cursor-pointer'
                : 'pointer-events-none cursor-not-allowed'
            }`}
            onClick={() => {
              if (player.isSelectable) {
                if (player.id === selectedId) {
                  onSelect?.(null)
                } else {
                  onSelect?.(player)
                }
              } else toast.error('Bạn không thể chọn người này')
            }}
          >
            <CardContent className="flex flex-col items-center p-3">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-colors hover:scale-105 ${
                      player.id === selectedId
                        ? 'bg-yellow-400 text-black'
                        : 'bg-zinc-600 text-white hover:bg-zinc-500'
                    }`}
                    aria-label={`View ${player.username} info`}
                  >
                    {renderAvatar(player)}
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[320px] p-5">
                  <DialogTitle className="sr-only">Player info</DialogTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-2xl font-bold">
                      {renderAvatar(player)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold">
                        {player.username}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {player.status === 'gm' ? 'Game Master' : 'Player'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">ID</div>
                      <div className="truncate text-white">{player.id}</div>
                    </div>
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Status</div>
                      <div className="text-white capitalize">{player.status}</div>
                    </div>
                    {player.id === currentPlayerId && (
                      <div className="rounded-md bg-zinc-800 p-2">
                        <div className="text-zinc-400">Role</div>
                        <div className="text-white">{player.role || '—'}</div>
                      </div>
                    )}
                    <div className="rounded-md bg-zinc-800 p-2">
                      <div className="text-zinc-400">Alive</div>
                      <div className="text-white">
                        {player.alive ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="text-center">
                <div className="w-full truncate text-sm font-medium text-white">
                  {truncateName(player.username)}
                </div>
                {mode === 'room' && !player.alive && (
                  <div className="mt-1 text-xs text-red-500 font-bold tracking-wider animate-pulse">
                    ĐÃ CHẾT
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

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
              <div className="text-sm text-zinc-500">Empty</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
