import type { AudioEvent } from './types'

export const AudioQueue = ({
  audioQueue,
  playAudio,
}: {
  audioQueue: AudioEvent[]
  playAudio: (audio: AudioEvent | null) => void
}) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-blue-400">
      📋 Hàng đợi âm thanh
    </h2>
    {audioQueue.length > 0 ? (
      <div className="space-y-2">
        {audioQueue.map((audio: AudioEvent, index: number) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-gray-700 p-3"
          >
            <span className="text-lg">🔊</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{audio.message}</p>
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
      </div>
    ) : (
      <p className="text-gray-400">Không có âm thanh trong hàng đợi</p>
    )}
  </div>
)
