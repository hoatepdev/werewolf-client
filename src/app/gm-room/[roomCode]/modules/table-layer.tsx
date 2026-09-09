'use client'

import type { AudioEvent, AudioStatus } from './types'
import type { Player } from '@/types/player'
import { AudioPanel } from './audio-panel'
import { SafePlayerList } from './player-list-safe'
import { PrivateTrigger } from './private-trigger'

interface TableLayerProps {
  currentAudio: AudioEvent | null
  isPlaying: boolean
  audioStatus: AudioStatus
  stopAudio: () => void
  audioQueue: AudioEvent[]
  playAudio: (audio: AudioEvent | null) => void
  players: Player[]
  onActivatePrivate: () => void
}

export function TableLayer({
  currentAudio,
  isPlaying,
  audioStatus,
  stopAudio,
  audioQueue,
  playAudio,
  players,
  onActivatePrivate,
}: TableLayerProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AudioPanel
          currentAudio={currentAudio}
          isPlaying={isPlaying}
          audioStatus={audioStatus}
          stopAudio={stopAudio}
          audioQueue={audioQueue}
          playAudio={playAudio}
        />
        <SafePlayerList players={players} />
      </div>

      <PrivateTrigger onActivate={onActivatePrivate} />
    </>
  )
}
