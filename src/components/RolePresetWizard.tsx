'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { LIST_ROLE } from '@/constants/role'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RoleSelection } from '@/components/RoleSelection'
import { cn } from '@/lib/utils'
import { hoverTapVariants, staggerContainerVars, staggerItemVars } from '@/lib/motion'
import type { Role } from '@/types/role'
import {
  ROLE_PRESETS,
  buildPresetRoleCounts,
  countSelectedRoles,
  fillRemainingWithVillagers,
  flattenRoleCounts,
  getPresetById,
  getRecommendedPresetId,
  getRoleCounts,
  validateRoleComposition,
  type RoleCounts,
  type RolePresetId,
} from '@/lib/role-presets'

interface RolePresetWizardProps {
  open: boolean
  playerCount: number
  initialRoles?: Role[]
  initialPresetId?: RolePresetId | 'custom' | null
  onApply: (roles: Role[], meta: { presetId: RolePresetId | 'custom' }) => void
  onClose: () => void
}

const STEP_LABELS = ['Kiểu ván', 'Tinh chỉnh', 'Xem lại']

export function RolePresetWizard({
  open,
  playerCount,
  initialRoles = [],
  initialPresetId = null,
  onApply,
  onClose,
}: RolePresetWizardProps) {
  const recommendedPresetId = getRecommendedPresetId(playerCount)
  const [step, setStep] = useState(0)
  const [selectedPresetId, setSelectedPresetId] = useState<
    RolePresetId | 'custom'
  >(initialPresetId ?? recommendedPresetId)
  const [draftCounts, setDraftCounts] = useState<RoleCounts>({})

  const selectedRoles = useMemo(() => flattenRoleCounts(draftCounts), [draftCounts])
  const selectedCount = countSelectedRoles(draftCounts)
  const validation = useMemo(
    () => validateRoleComposition(selectedRoles, playerCount),
    [playerCount, selectedRoles],
  )
  const selectedPreset = getPresetById(
    selectedPresetId === 'custom' ? null : selectedPresetId,
  )

  useEffect(() => {
    if (!open) return

    const presetId = initialPresetId ?? recommendedPresetId
    setStep(0)
    setSelectedPresetId(presetId)

    if (initialRoles.length > 0) {
      setDraftCounts(getRoleCounts(initialRoles))
    } else if (presetId === 'custom') {
      setDraftCounts({})
    } else {
      setDraftCounts(buildPresetRoleCounts(presetId, playerCount))
    }
  }, [initialPresetId, initialRoles, open, playerCount, recommendedPresetId])

  const applyPreset = (presetId: RolePresetId | 'custom') => {
    setSelectedPresetId(presetId)
    if (presetId === 'custom') {
      setDraftCounts(initialRoles.length > 0 ? getRoleCounts(initialRoles) : {})
    } else {
      setDraftCounts(buildPresetRoleCounts(presetId, playerCount))
    }
    setStep(1)
  }

  const resetToPreset = () => {
    if (selectedPresetId === 'custom') {
      setDraftCounts({})
      return
    }

    setDraftCounts(buildPresetRoleCounts(selectedPresetId, playerCount))
  }

  const handleApply = () => {
    if (!validation.isValid) return
    onApply(selectedRoles, { presetId: selectedPresetId })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thiết lập preset vai trò</DialogTitle>
          <DialogDescription>
            Chọn kiểu ván, tinh chỉnh số lượng vai, rồi áp dụng trước khi phân vai.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/60 p-2">
          {STEP_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                'flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors',
                step === index
                  ? 'bg-yellow-400 text-black'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
              )}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <motion.div
            variants={staggerContainerVars}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {ROLE_PRESETS.map((preset) => {
              const presetCounts = buildPresetRoleCounts(preset.id, playerCount)
              const presetCount = countSelectedRoles(presetCounts)
              const isRecommended = preset.id === recommendedPresetId

              return (
                <motion.button
                  key={preset.id}
                  type="button"
                  variants={staggerItemVars}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => applyPreset(preset.id)}
                  className="block w-full text-left"
                >
                  <motion.div variants={hoverTapVariants}>
                    <Card
                      className={cn(
                        'transition-colors hover:border-yellow-400/70',
                        selectedPresetId === preset.id &&
                          'border-yellow-400 bg-zinc-700/50',
                      )}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <span className="text-2xl">{preset.emoji}</span>
                            <div>
                              <CardTitle className="text-base text-white">
                                {preset.name}
                              </CardTitle>
                              <CardDescription>{preset.description}</CardDescription>
                              <p className="mt-2 text-xs text-zinc-500">
                                {preset.tone} · {presetCount}/{playerCount} vai
                              </p>
                            </div>
                          </div>
                          {isRecommended && (
                            <span className="rounded-full bg-yellow-400/15 px-2 py-1 text-xs font-semibold text-yellow-300">
                              Gợi ý
                            </span>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </motion.button>
              )
            })}

            <motion.button
              type="button"
              variants={staggerItemVars}
              onClick={() => applyPreset('custom')}
              className="block w-full text-left"
            >
              <Card
                className={cn(
                  'border-dashed transition-colors hover:border-zinc-500',
                  selectedPresetId === 'custom' && 'border-yellow-400 bg-zinc-700/50',
                )}
              >
                <CardHeader className="p-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">🛠️</span>
                    <div>
                      <CardTitle className="text-base text-white">
                        Tùy chỉnh từ đầu
                      </CardTitle>
                      <CardDescription>
                        Tự chọn từng vai nếu GM đã có luật riêng cho nhóm.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Đã chọn {selectedCount}/{playerCount} vai
                  </p>
                  <p className="text-xs text-zinc-400">
                    {selectedPreset?.name ?? 'Cấu hình tùy chỉnh'}
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-400" />
              </div>
            </div>

            <RoleSelection
              value={draftCounts}
              onCountsChange={setDraftCounts}
              totalCount={playerCount}
              showSummary={false}
            />

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setDraftCounts(fillRemainingWithVillagers(draftCounts, playerCount))
                }
                className="rounded-xl bg-zinc-800 px-2 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
              >
                Điền dân
              </button>
              <button
                type="button"
                onClick={resetToPreset}
                className="flex items-center justify-center gap-1 rounded-xl bg-zinc-800 px-2 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
              <button
                type="button"
                onClick={() => setDraftCounts({})}
                className="flex items-center justify-center gap-1 rounded-xl bg-zinc-800 px-2 py-2 text-xs font-semibold text-red-300 hover:bg-zinc-700"
              >
                <Trash2 className="h-3 w-3" /> Xóa
              </button>
            </div>

            <ValidationMessages
              errors={validation.errors}
              warnings={validation.warnings}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="border-yellow-400/40 bg-yellow-400/10">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base text-yellow-300">
                  <CheckCircle2 className="h-5 w-5" /> Xem lại cấu hình
                </CardTitle>
                <CardDescription>
                  Vai trò sẽ được phân ngẫu nhiên và gửi riêng cho từng người chơi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {LIST_ROLE.filter((role) => (draftCounts[role.id] ?? 0) > 0).map(
                  (role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-lg bg-zinc-900/70 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-zinc-100">
                        <span>{role.emoji}</span>
                        {role.name}
                      </span>
                      <span className="font-bold text-yellow-300">
                        x{draftCounts[role.id]}
                      </span>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <p className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 text-sm text-zinc-300">
              GM chỉ đang chọn thành phần vai. Ứng dụng sẽ không gán vai cụ thể cho
              từng người cho đến khi bấm phân vai ngẫu nhiên ở màn phê duyệt.
            </p>

            <ValidationMessages
              errors={validation.errors}
              warnings={validation.warnings}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="default" onClick={onClose}>
            Đóng
          </Button>
          {step < 2 ? (
            <Button type="button" variant="yellow" onClick={() => setStep(step + 1)}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="button"
              variant="yellow"
              disabled={!validation.isValid}
              onClick={handleApply}
            >
              Áp dụng
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ValidationMessages({
  errors,
  warnings,
}: {
  errors: string[]
  warnings: string[]
}) {
  if (errors.length === 0 && warnings.length === 0) return null

  return (
    <div className="space-y-2">
      {errors.map((error) => (
        <div
          key={error}
          className="flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ))}
      {warnings.map((warning) => (
        <div
          key={warning}
          className="flex gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-100"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {warning}
        </div>
      ))}
    </div>
  )
}
