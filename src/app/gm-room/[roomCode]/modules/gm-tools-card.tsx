'use client'

import { RefreshCw, RotateCcw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VotingProgress } from './types'
import { HoldToConfirmButton } from './hold-to-confirm-button'

interface GmToolsCardProps {
  phase: string
  isConnected: boolean
  commandError?: string | null
  pendingGmCommand?: string | null
  votingProgress?: VotingProgress | null
  onNextPhase: () => void
  onRefresh: () => void
  onResetRoom: () => void
}

const PHASE_LABELS: Record<string, string> = {
  night: 'Đêm',
  day: 'Ban ngày',
  voting: 'Bỏ phiếu',
  conclude: 'Kết luận',
  ended: 'Kết thúc',
}

export function GmToolsCard({
  phase,
  isConnected,
  commandError,
  pendingGmCommand,
  votingProgress,
  onNextPhase,
  onRefresh,
  onResetRoom,
}: GmToolsCardProps) {
  const isResetting = pendingGmCommand === 'reset'
  const isChangingPhase = phase === 'night' || phase === 'voting' || phase === 'ended'

  return (
    <div className="rounded-lg border border-yellow-500/20 bg-zinc-800/80 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-yellow-400">🛠️ Công cụ GM</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Điều hành ván ở chế độ riêng tư, không hiển thị cho người chơi.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isConnected
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-zinc-900/70 p-3">
          <p className="text-zinc-500">Giai đoạn hiện tại</p>
          <p className="mt-1 font-semibold text-white">
            {PHASE_LABELS[phase] || phase || 'Chưa bắt đầu'}
          </p>
        </div>
        {phase === 'voting' && votingProgress ? (
          <div className="rounded-lg bg-zinc-900/70 p-3">
            <p className="text-zinc-500">Tiến độ bỏ phiếu</p>
            <p className="mt-1 font-semibold text-white">
              {votingProgress.respondedCount}/{votingProgress.totalVoters} đã phản hồi
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-zinc-900/70 p-3">
            <p className="text-zinc-500">Lệnh đang chạy</p>
            <p className="mt-1 font-semibold text-white">
              {pendingGmCommand ? 'Đang xử lý...' : 'Sẵn sàng'}
            </p>
          </div>
        )}
      </div>

      {commandError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-200">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{commandError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="black"
          onClick={onRefresh}
          disabled={Boolean(pendingGmCommand)}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Đồng bộ
        </Button>
        <HoldToConfirmButton
          onConfirm={onNextPhase}
          disabled={Boolean(pendingGmCommand) || isChangingPhase}
          className="w-full"
        />
        <Button
          type="button"
          onClick={onResetRoom}
          disabled={isResetting}
          className="gap-2 bg-red-600 text-white hover:bg-red-700"
        >
          <RotateCcw className="h-4 w-4" />
          {phase === 'ended' ? 'Chơi lại' : 'Reset ván'}
        </Button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Lưu ý: loại bỏ/hồi sinh thủ công chỉ chỉnh trạng thái sống/chết. Nếu đang
        giữa lượt đặc biệt, GM vẫn cần điều hành nhịp chơi phù hợp.
      </p>
    </div>
  )
}
