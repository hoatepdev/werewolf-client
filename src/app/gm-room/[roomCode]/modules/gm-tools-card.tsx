'use client'

import { Clock, FastForward, Plus, RefreshCw, RotateCcw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HoldToConfirmButton } from '@/components/hold-to-confirm-button'
import type { VotingProgress } from './types'

interface GmToolsCardProps {
  phase: string
  commandError?: string | null
  pendingGmCommand?: string | null
  votingProgress?: VotingProgress | null
  onNextPhase: () => void
  onRefresh: () => void
  onResetRoom: () => void
  onStartDayTimer: (durationMs?: number) => void | Promise<boolean>
  onExtendDayTimer: (deltaMs: number) => void | Promise<boolean>
  onSkipDayTimer: () => void | Promise<boolean>
}

export function GmToolsCard({
  phase,
  commandError,
  pendingGmCommand,
  votingProgress,
  onNextPhase,
  onRefresh,
  onResetRoom,
  onStartDayTimer,
  onExtendDayTimer,
  onSkipDayTimer,
}: GmToolsCardProps) {
  const isResetting = pendingGmCommand === 'reset'
  const isChangingPhase = phase === 'night' || phase === 'voting' || phase === 'ended'
  const isDayTimerPending = pendingGmCommand?.startsWith('day-timer:') ?? false

  return (
    <div>
      <div className="mb-4 text-sm">
        {phase === 'voting' && votingProgress ? (
          <p className="text-zinc-400">
            Tiến độ bỏ phiếu:{' '}
            <span className="font-semibold text-white">
              {votingProgress.respondedCount}/{votingProgress.totalVoters} đã phản hồi
            </span>
          </p>
        ) : (
          <p className="text-zinc-500">
            {pendingGmCommand ? 'Đang xử lý lệnh...' : 'Sẵn sàng'}
          </p>
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

      {phase === 'day' && (
        <div className="mb-4 rounded-lg border border-yellow-400/20 bg-yellow-950/20 p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-200">
            <Clock className="h-4 w-4" />
            Timer thảo luận
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              type="button"
              variant="black"
              onClick={() => onStartDayTimer(3 * 60 * 1000)}
              disabled={Boolean(pendingGmCommand)}
              className="gap-2 text-xs"
            >
              <Clock className="h-4 w-4" />
              Bắt đầu 3 phút
            </Button>
            <Button
              type="button"
              variant="black"
              onClick={() => onExtendDayTimer(30 * 1000)}
              disabled={Boolean(pendingGmCommand)}
              className="gap-2 text-xs"
            >
              <Plus className="h-4 w-4" />
              +30 giây
            </Button>
            <Button
              type="button"
              variant="black"
              onClick={() => onExtendDayTimer(60 * 1000)}
              disabled={Boolean(pendingGmCommand)}
              className="gap-2 text-xs"
            >
              <Plus className="h-4 w-4" />
              +1 phút
            </Button>
            <Button
              type="button"
              onClick={onSkipDayTimer}
              disabled={Boolean(pendingGmCommand)}
              className="gap-2 bg-orange-600 text-xs text-white hover:bg-orange-700"
            >
              <FastForward className="h-4 w-4" />
              {isDayTimerPending ? 'Đang xử lý...' : 'Kết thúc'}
            </Button>
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
    </div>
  )
}
