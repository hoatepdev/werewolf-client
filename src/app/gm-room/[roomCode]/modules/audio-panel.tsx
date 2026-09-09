'use client'

import { useState } from 'react'
import type { AudioEvent, AudioStatus } from './types'

const MAX_QUEUE_ITEMS = 5

interface AudioPanelProps {
  currentAudio: AudioEvent | null
  isPlaying: boolean
  audioStatus: AudioStatus
  stopAudio: () => void
  audioQueue: AudioEvent[]
  playAudio: (audio: AudioEvent | null) => void
}

export function AudioPanel({
  currentAudio,
  isPlaying,
  audioStatus,
  stopAudio,
  audioQueue,
  playAudio,
}: AudioPanelProps) {
  const [queueOpen, setQueueOpen] = useState(false)

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h2 className="mb-4 text-lg font-bold text-yellow-400">Âm thanh</h2>
      {currentAudio ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {audioStatus === 'error' ? '⚠️' : '🔊'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{currentAudio.message}</p>
            {currentAudio.role && (
              <p className="text-sm text-gray-400">Vai: {currentAudio.role}</p>
            )}
            {audioStatus === 'error' && (
              <p className="text-sm text-red-400">
                Lỗi phát âm thanh, đang thử lại...
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && audioStatus === 'speaking' ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-sm text-green-400">Đang phát...</span>
              </div>
            ) : audioStatus === 'error' ? (
              <span className="text-sm text-red-400">Lỗi</span>
            ) : (
              <span className="text-sm text-gray-400">Sẵn sàng</span>
            )}
            <button
              onClick={stopAudio}
              className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium hover:bg-red-700"
            >
              Dừng
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Không có âm thanh đang phát</p>
      )}

      <button
        type="button"
        onClick={() => setQueueOpen(!queueOpen)}
        aria-expanded={queueOpen}
        className="mt-4 flex w-full items-center justify-between border-t border-zinc-700 pt-3 text-left text-sm font-semibold text-zinc-300"
      >
        <span>Hàng đợi ({audioQueue.length})</span>
        <span className="text-xs text-zinc-500">
          {queueOpen ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
        </span>
      </button>
      {queueOpen && (
        <div className="mt-2 space-y-2">
          {audioQueue.length === 0 ? (
            <p className="text-sm text-gray-400">
              Không có âm thanh trong hàng đợi
            </p>
          ) : (
            <>
              {audioQueue.slice(0, MAX_QUEUE_ITEMS).map((audio, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-gray-700 p-3"
                >
                  <span className="text-lg">🔊</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {audio.message}
                    </p>
                    {audio.role && (
                      <p className="text-xs text-gray-400">{audio.role}</p>
                    )}
                  </div>
                  <button
                    onClick={() => playAudio(audio)}
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-medium hover:bg-blue-700"
                  >
                    Phát
                  </button>
                </div>
              ))}
              {audioQueue.length > MAX_QUEUE_ITEMS && (
                <p className="text-xs text-gray-400">
                  +{audioQueue.length - MAX_QUEUE_ITEMS} khác
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
