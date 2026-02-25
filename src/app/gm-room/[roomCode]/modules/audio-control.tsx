import type { AudioEvent, AudioStatus } from './types'

export const AudioControl = ({
  currentAudio,
  isPlaying,
  audioStatus,
  stopAudio,
}: {
  currentAudio: AudioEvent | null
  isPlaying: boolean
  audioStatus: AudioStatus
  stopAudio: () => void
}) => (
  <div className="rounded-lg bg-gray-800 p-6">
    <h2 className="mb-4 text-lg font-bold text-yellow-400">
      Điều khiển âm thanh
    </h2>
    {currentAudio ? (
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {audioStatus === 'error' ? '⚠️' : '🔊'}
        </span>
        <div className="flex-1">
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
  </div>
)
