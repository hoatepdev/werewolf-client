import React from 'react'
import { NightResult, useRoomStore } from '@/hook/useRoomStore'
import { PlayerGrid } from '../PlayerGrid'

const DayPhase: React.FC<{ nightResult: NightResult | null }> = ({
  nightResult,
}) => {
  const { approvedPlayers, playerId } = useRoomStore()

  return (
    <div className="relative h-full w-full flex-1">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-yellow-400">
            ☀️ Giai đoạn ngày
          </h3>
          <p className="text-sm text-gray-300">
            Trời sáng rồi, mời mọi người thức dậy
          </p>
        </div>

        <div className="w-full">
          <PlayerGrid
            players={approvedPlayers}
            mode="room"
            currentPlayerId={playerId}
          />
        </div>
      </div>

      {nightResult && (
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-lg bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-bold text-red-400">
              🌙 &nbsp; Kết quả đêm
            </h3>
            {nightResult.diedPlayerIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  Người chết:{' '}
                  {nightResult.deaths
                    ? nightResult.deaths
                        .map((d) => {
                          const player = approvedPlayers.find(
                            (p) => p.id === d.playerId,
                          )
                          const causeText =
                            d.cause === 'werewolf'
                              ? 'bị sói cắn'
                              : d.cause === 'witch'
                                ? 'bị đầu độc'
                                : ''
                          return `${player?.username}${causeText ? ` (${causeText})` : ''}`
                        })
                        .join(', ')
                    : nightResult.diedPlayerIds
                        .map(
                          (id) =>
                            approvedPlayers.find((p) => p.id === id)?.username,
                        )
                        .join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-green-400">Không ai chết trong đêm</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DayPhase
