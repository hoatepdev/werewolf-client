'use client'

import React, { useMemo } from 'react'
import { Player } from '@/types/player'
import { Card, CardContent } from '@/components/ui/card'
import { renderAvatar } from '@/helpers'
import { toast } from 'sonner'

interface PlayerGridProps {
  players: Player[]
  currentPlayerId?: string
  mode?: 'lobby' | 'room'
  selectedId?: string
  onSelect?: (player: Player) => void
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
  console.log('⭐ selectableList', selectableList)

  const listPlayer = useMemo(() => {
    return players.map((p) => ({
      ...p,
      isSelectable: selectableList?.some((sp) => sp.id === p.id && p.alive),
    }))
  }, [players, selectableList])

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
      {listPlayer.map((player) => (
        <Card
          key={player.id}
          className={`relative overflow-hidden transition-all duration-200 ${
            player.id === selectedId ||
            (currentPlayerId &&
              mode === 'lobby' &&
              player.id === currentPlayerId)
              ? 'bg-zinc-700/50 ring-2 ring-yellow-400'
              : 'bg-zinc-800'
          } ${mode === 'lobby' || player.alive ? '' : 'opacity-50'} ${
            player.isSelectable
              ? 'cursor-pointer'
              : 'pointer-events-none cursor-not-allowed opacity-50'
          }`}
          onClick={() => {
            if (player.isSelectable) onSelect?.(player)
            else toast.error('Bạn không thể chọn người này')
          }}
        >
          <CardContent className="flex flex-col items-center p-3">
            <div
              className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                player.id === selectedId
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-600 text-white'
              }`}
            >
              {renderAvatar(player)}
            </div>
            <div className="text-center">
              <div className="w-full truncate text-sm font-medium text-white">
                {truncateName(player.username)}
              </div>
              {mode === 'room' && !player.alive && (
                <div className="mt-1 text-xs text-red-400">Dead</div>
              )}
            </div>
          </CardContent>
        </Card>
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
