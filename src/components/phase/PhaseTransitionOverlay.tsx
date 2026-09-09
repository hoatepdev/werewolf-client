'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Moon, Scale, Sun, Vote, type LucideIcon } from 'lucide-react'
import { backdropVariants, slowEaseOut } from '@/lib/motion'

type PublicPhase = 'night' | 'day' | 'voting' | 'conclude'

type PhaseTransitionOverlayProps = {
  phase: PublicPhase | null
  nonce: number
  onComplete?: () => void
}

type PhaseTone = {
  kicker: string
  title: string
  description: string
  Icon: LucideIcon
  backdrop: string
  border: string
  accent: string
}

const PHASE_TONES: Record<PublicPhase, PhaseTone> = {
  night: {
    kicker: 'Màn đêm buông xuống',
    title: 'Đêm đến',
    description: 'Hãy giữ bí mật. Các vai trò ban đêm chuẩn bị hành động.',
    Icon: Moon,
    backdrop: 'bg-slate-950/95',
    border: 'border-blue-400',
    accent: 'text-blue-200',
  },
  day: {
    kicker: 'Bình minh lên',
    title: 'Ngày mới bắt đầu',
    description: 'Cả làng tỉnh dậy. Hãy quan sát, thảo luận và tìm ra sự thật.',
    Icon: Sun,
    backdrop: 'bg-amber-950/95',
    border: 'border-yellow-300',
    accent: 'text-yellow-200',
  },
  voting: {
    kicker: 'Đến giờ phán quyết',
    title: 'Bỏ phiếu',
    description: 'Chọn người bạn nghi ngờ nhất hoặc quyết định bỏ qua.',
    Icon: Vote,
    backdrop: 'bg-red-950/95',
    border: 'border-red-400',
    accent: 'text-red-200',
  },
  conclude: {
    kicker: 'Lá phiếu đã khép lại',
    title: 'Công bố kết quả',
    description: 'Cả làng chờ xem phán quyết cuối cùng của lượt này.',
    Icon: Scale,
    backdrop: 'bg-zinc-950/95',
    border: 'border-yellow-400',
    accent: 'text-yellow-200',
  },
}

const PhaseTransitionOverlay = ({
  phase,
  nonce,
  onComplete,
}: PhaseTransitionOverlayProps) => {
  const [visible, setVisible] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!phase) {
      setVisible(false)
      return
    }

    const displayMs = shouldReduceMotion ? 1900 : 2600
    setVisible(true)

    const hideTimer = window.setTimeout(() => setVisible(false), displayMs)
    const completeTimer = window.setTimeout(
      () => onCompleteRef.current?.(),
      displayMs + 320,
    )

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(completeTimer)
    }
  }, [phase, nonce, shouldReduceMotion])

  const tone = phase ? PHASE_TONES[phase] : null
  if (!tone) return null

  const { Icon } = tone
  const cardVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: slowEaseOut },
        },
        exit: {
          opacity: 0,
          y: -10,
          transition: { duration: 0.2, ease: slowEaseOut },
        },
      }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={`${phase}-${nonce}`}
          className={`pointer-events-none fixed inset-0 z-[55] flex items-center justify-center px-5 py-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] ${tone.backdrop}`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.section
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`w-full max-w-sm border-l-4 ${tone.border} bg-zinc-950 px-6 py-8 text-left`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Icon className={`h-10 w-10 ${tone.accent}`} strokeWidth={1.7} aria-hidden="true" />
            <p className="mt-6 text-xs font-bold tracking-[0.18em] text-zinc-500 uppercase">
              {tone.kicker}
            </p>
            <h2 className={`mt-2 text-4xl font-black tracking-tight ${tone.accent}`}>
              {tone.title}
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-300">
              {tone.description}
            </p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PhaseTransitionOverlay
