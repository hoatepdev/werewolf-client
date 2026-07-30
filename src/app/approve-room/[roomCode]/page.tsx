'use client'
import React, { useCallback, useState, useEffect, use, useMemo } from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2Icon,
  ScanQrCode,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import { useRoomStore } from '@/hook/useRoomStore'
import { getSocket } from '@/lib/socket'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Player } from '@/types/player'
import { RolePresetWizard } from '@/components/RolePresetWizard'
import { renderAvatar } from '@/helpers'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/PageHeader'
import MainLayout from '@/components/MainLayout'
import { buildJoinRoomUrl, formatRoomCode } from '@/lib/room-code'
import { ReadyChecklist } from '@/components/ReadyChecklist'
import {
  countSelectedRoles,
  getPresetById,
  getRoleCounts,
  validateRoleComposition,
  type RolePresetId,
} from '@/lib/role-presets'
import { LIST_ROLE } from '@/constants/role'
import type { Role } from '@/types/role'

const initialApproved: Player[] = []
const initialPending: Player[] = []
const MIN_PLAYER = 4

type AssignStatus = 'idle' | 'assigning' | 'waiting'

export default function ApprovePlayerPage({
  params,
}: {
  params: Promise<{ roomCode: string }>
}) {
  const { roomCode } = use(params)
  const socket = getSocket()
  const router = useRouter()

  const [approvedPlayers, setApprovedPlayers] = useState(initialApproved)
  const [pendingPlayers, setPendingPlayers] = useState(initialPending)
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<
    RolePresetId | 'custom' | null
  >(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [assignStatus, setAssignStatus] = useState<AssignStatus>('idle')
  const [origin, setOrigin] = useState('')
  const joinRoomUrl = useMemo(
    () => (roomCode ? buildJoinRoomUrl(roomCode, origin) : ''),
    [origin, roomCode],
  )

  const { setApprovedPlayers: setApprovedPlayersStore } = useRoomStore()

  const handleStartGameSuccess = useCallback(() => {
    toast.success('Bắt đầu game...')
    setTimeout(() => {
      router.push(`/gm-room/${roomCode}`)
    }, 2000)
  }, [roomCode, router])

  const handleDataPlayers = useCallback((data: Player[]) => {
    const approvedPlayers: Player[] = []
    const pendingPlayers: Player[] = []

    data.forEach((player: Player) => {
      if (player.status === 'approved') {
        approvedPlayers.push(player)
      } else if (player.status === 'pending') {
        pendingPlayers.push(player)
      }
    })

    setPendingPlayers(pendingPlayers)
    setApprovedPlayers(approvedPlayers)
    setApprovedPlayersStore(approvedPlayers)
  }, [setApprovedPlayersStore])

  useEffect(() => {
    setOrigin(window.location.origin)
    if (!socket.connected) socket.connect()

    socket.emit('rq_gm:getPlayers', { roomCode })

    socket.on('room:updatePlayers', handleDataPlayers)
    socket.on('room:readySuccess', handleStartGameSuccess)
    return () => {
      socket.off('room:updatePlayers', handleDataPlayers)
      socket.off('room:readySuccess', handleStartGameSuccess)
    }
  }, [handleDataPlayers, handleStartGameSuccess, roomCode, socket])

  const handleApprove = (player: Player) => {
    setApprovedPlayers((prev) => [...prev, player])
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id))
    if (!socket.connected) socket.connect()
    socket.emit('rq_gm:approvePlayer', { roomCode, playerId: player.id })
  }

  const handleReject = (player: Player) => {
    setPendingPlayers((prev) => prev.filter((p) => p.id !== player.id))
    if (!socket.connected) socket.connect()
    socket.emit('rq_gm:rejectPlayer', { roomCode, playerId: player.id })
  }

  const handleApplyRoleComposition = (
    roles: Role[],
    meta: { presetId: RolePresetId | 'custom' },
  ) => {
    setSelectedRoles(roles)
    setSelectedPresetId(meta.presetId)
    setAssignStatus('idle')
    toast.success('Đã áp dụng cấu hình vai trò')
  }

  const handleClearRoleComposition = () => {
    setSelectedRoles([])
    setSelectedPresetId(null)
    setAssignStatus('idle')
  }

  const countPlayer = approvedPlayers.length
  const rolesAssigned =
    approvedPlayers.length > 0 && approvedPlayers.every((player) => Boolean(player.role))
  const validation = useMemo(
    () => validateRoleComposition(selectedRoles, countPlayer, MIN_PLAYER),
    [countPlayer, selectedRoles],
  )
  const isCompositionStale =
    selectedRoles.length > 0 && selectedRoles.length !== countPlayer
  const canContinue =
    !rolesAssigned &&
    countPlayer >= MIN_PLAYER &&
    validation.isValid &&
    !isCompositionStale &&
    assignStatus === 'idle'
  const selectedPreset = getPresetById(selectedPresetId)
  const assignButtonText = rolesAssigned
    ? 'Chờ người chơi sẵn sàng'
    : assignStatus === 'assigning'
      ? 'Đang phân vai...'
      : assignStatus === 'waiting'
        ? 'Chờ người chơi chọn vai'
        : 'Phân vai ngẫu nhiên'

  const handleRandomizeRoles = () => {
    setAssignStatus('assigning')
    socket.emit(
      'rq_gm:randomizeRoles',
      {
        roomCode,
        roles: selectedRoles,
      },
      (message: string) => {
        if (message) {
          setAssignStatus('idle')
          toast.error(message || 'Không thể phân vai ngẫu nhiên')
        } else {
          setAssignStatus('waiting')
          toast.success('Đã gửi vai trò cho người chơi')
        }
      },
    )
  }

  return (
    <MainLayout>
      <PageHeader
        title="Phê duyệt người chơi"
        right={
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="text-2xl text-yellow-400 hover:text-yellow-500"
                aria-label="Hiển thị mã QR"
              >
                <ScanQrCode className="h-6 w-6" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mã QR tham gia game</DialogTitle>
                <DialogDescription>
                  Người chơi quét mã này để mở trang tham gia phòng
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-xl bg-white p-2">
                  {roomCode ? (
                    <QRCode
                      value={joinRoomUrl}
                      size={180}
                      bgColor="#fff"
                      fgColor="#000"
                      style={{ borderRadius: '0.75rem' }}
                    />
                  ) : (
                    <span className="text-gray-400">Không có mã phòng</span>
                  )}
                </div>
                <div className="mb-4 text-center text-2xl font-bold tracking-[0.35em] text-yellow-400">
                  {formatRoomCode(roomCode)}
                </div>
                <DialogClose asChild>
                  <button
                    className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-200 hover:bg-zinc-700"
                    aria-label="Đóng hộp thoại QR"
                  >
                    Đóng
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <div className="w-full">
          {rolesAssigned ? (
            <div className="mb-6">
              <ReadyChecklist
                players={approvedPlayers}
                title="Danh sách sẵn sàng"
                assignedRoles={rolesAssigned}
              />
            </div>
          ) : (
            <>
              <div className="mb-2 text-base font-semibold tracking-wide">
                NGƯỜI CHƠI ĐÃ DUYỆT
              </div>
              <div className="mb-6 space-y-2">
                {approvedPlayers.length === 0 ? (
                  <div className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-zinc-400">
                    Không có người chơi
                  </div>
                ) : (
                  approvedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-zinc-800 px-4 py-3"
                    >
                      <span className="flex w-6 items-center justify-center text-2xl font-bold text-yellow-400">
                        {renderAvatar(player)}
                      </span>
                      <span className="flex-1 text-base font-medium">
                        {player.username}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          <div className="mb-2 text-base font-semibold tracking-wide">
            NGƯỜI CHƠI CHỜ DUYỆT
          </div>
          <div className="mb-6 space-y-2">
            {pendingPlayers.length === 0 ? (
              <div className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-zinc-400">
                Không có người chơi
              </div>
            ) : (
              pendingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-zinc-800 px-4 py-3"
                >
                  <span className="flex w-6 items-center justify-center text-2xl font-bold text-yellow-400">
                    {renderAvatar(player)}
                  </span>
                  <span className="flex-1 text-base font-medium">
                    {player.username}
                  </span>
                  <div className="flex gap-4">
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-green-500 text-lg text-green-500 hover:bg-green-600 hover:text-white focus:outline-none"
                      onClick={() => {
                        handleApprove(player)
                      }}
                      aria-label="Duyệt"
                    >
                      <Check className="h-6 w-6" />
                    </button>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-red-500 text-lg text-red-500 hover:bg-red-600 hover:text-white focus:outline-none active:bg-red-700"
                      onClick={() => {
                        handleReject(player)
                      }}
                      aria-label="Từ chối"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {!rolesAssigned && (
          <>
            <hr className="my-4 w-full border-t border-zinc-700" />
            <RoleSetupSummary
              playerCount={countPlayer}
              selectedRoles={selectedRoles}
              presetName={selectedPreset?.name ?? null}
              errors={validation.errors}
              warnings={validation.warnings}
              isStale={isCompositionStale}
              minPlayer={MIN_PLAYER}
              onOpenWizard={() => setWizardOpen(true)}
              onClear={handleClearRoleComposition}
            />
          </>
        )}
      </div>

      <RolePresetWizard
        open={wizardOpen}
        playerCount={countPlayer}
        initialRoles={selectedRoles}
        initialPresetId={selectedPresetId}
        onApply={handleApplyRoleComposition}
        onClose={() => setWizardOpen(false)}
      />

      <div className="mx-auto mt-auto mb-2 flex w-full max-w-sm flex-col">
        <div className="mb-2 text-center text-sm text-zinc-400">
          {rolesAssigned
            ? 'Đang chờ tất cả người chơi xác nhận sẵn sàng.'
            : isCompositionStale
              ? 'Số người chơi đã thay đổi. Hãy cập nhật preset trước khi phân vai.'
              : 'Nhấn TIẾP TỤC sẽ phân vai ngẫu nhiên cho người chơi.'}
        </div>
        <Button
          variant="yellow"
          className="w-full"
          disabled={!canContinue}
          onClick={handleRandomizeRoles}
        >
          {assignStatus !== 'idle' ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" />
              <span>{assignButtonText}</span>
            </div>
          ) : (
            <div>{assignButtonText}</div>
          )}
        </Button>
      </div>
    </MainLayout>
  )
}

function RoleSetupSummary({
  playerCount,
  selectedRoles,
  presetName,
  errors,
  warnings,
  isStale,
  minPlayer,
  onOpenWizard,
  onClear,
}: {
  playerCount: number
  selectedRoles: Role[]
  presetName: string | null
  errors: string[]
  warnings: string[]
  isStale: boolean
  minPlayer: number
  onOpenWizard: () => void
  onClear: () => void
}) {
  const roleCounts = getRoleCounts(selectedRoles)
  const selectedCount = countSelectedRoles(roleCounts)
  const hasComposition = selectedRoles.length > 0
  const canSetup = playerCount >= minPlayer

  return (
    <div className="mb-16 w-full rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold tracking-wide text-white">
            <Wand2 className="h-5 w-5 text-yellow-400" />
            THIẾT LẬP VAI TRÒ
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {presetName ?? (hasComposition ? 'Tùy chỉnh' : 'Chưa thiết lập')}
          </p>
        </div>
        <div className="rounded-full bg-zinc-800 px-3 py-1 text-sm font-bold text-yellow-300">
          {selectedCount}/{playerCount}
        </div>
      </div>

      {!canSetup ? (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-100">
          Cần ít nhất {minPlayer} người chơi đã duyệt để thiết lập và phân vai.
        </div>
      ) : hasComposition ? (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {LIST_ROLE.filter((role) => (roleCounts[role.id] ?? 0) > 0).map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between rounded-xl bg-zinc-800 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-zinc-100">
                <span>{role.emoji}</span>
                {role.name}
              </span>
              <span className="font-bold text-yellow-300">x{roleCounts[role.id]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 p-4 text-center text-sm text-zinc-400">
          Chọn preset để tự động gợi ý thành phần vai theo số người chơi.
        </div>
      )}

      {isStale && (
        <StatusMessage tone="error">
          Số người chơi đã thay đổi. Hãy cập nhật cấu hình trước khi phân vai.
        </StatusMessage>
      )}
      {!isStale && hasComposition && errors.length === 0 && (
        <StatusMessage tone="success">Cấu hình đã sẵn sàng để phân vai.</StatusMessage>
      )}
      {!isStale && errors.slice(0, 2).map((error) => (
        <StatusMessage key={error} tone="error">
          {error}
        </StatusMessage>
      ))}
      {!isStale && warnings.slice(0, 1).map((warning) => (
        <StatusMessage key={warning} tone="warning">
          {warning}
        </StatusMessage>
      ))}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="yellow"
          disabled={!canSetup}
          onClick={onOpenWizard}
        >
          {hasComposition ? 'Chỉnh cấu hình' : 'Thiết lập nhanh'}
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={!hasComposition}
          onClick={onClear}
        >
          Xóa cấu hình
        </Button>
      </div>
    </div>
  )
}

function StatusMessage({
  tone,
  children,
}: {
  tone: 'success' | 'warning' | 'error'
  children: React.ReactNode
}) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle

  return (
    <div
      className={
        tone === 'success'
          ? 'mb-2 flex gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200'
          : tone === 'warning'
            ? 'mb-2 flex gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-100'
            : 'mb-2 flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200'
      }
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </div>
  )
}
