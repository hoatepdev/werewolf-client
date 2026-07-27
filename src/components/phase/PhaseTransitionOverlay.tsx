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
  card: string
  glow: string
  accent: string
  iconRing: string
  particle: string
}

const PHASE_TONES: Record<PublicPhase, PhaseTone> = {
  night: {
    kicker: 'MÀN ĐÊM BUÔNG XUỐNG',
    title: 'Đêm đến',
    description: 'Hãy giữ bí mật. Các vai trò ban đêm chuẩn bị hành động.',
    Icon: Moon,
    backdrop: 'bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-black/95',
    card: 'border-indigo-300/20 bg-slate-950/70 shadow-indigo-950/70',
    glow: 'from-indigo-400/30 via-blue-500/20 to-transparent',
    accent: 'from-indigo-200 via-blue-300 to-cyan-100',
    iconRing: 'border-indigo-200/30 bg-indigo-300/10 text-indigo-100 shadow-indigo-400/20',
    particle: 'bg-indigo-100/70',
  },
  day: {
    kicker: 'BÌNH MINH LÊN',
    title: 'Ngày mới bắt đầu',
    description: 'Cả làng tỉnh dậy. Hãy quan sát, thảo luận và tìm ra sự thật.',
    Icon: Sun,
    backdrop: 'bg-gradient-to-br from-amber-950/90 via-orange-900/80 to-sky-950/90',
    card: 'border-amber-200/25 bg-zinc-950/65 shadow-amber-950/60',
    glow: 'from-yellow-300/35 via-orange-400/25 to-transparent',
    accent: 'from-yellow-100 via-amber-200 to-orange-300',
    iconRing: 'border-amber-100/40 bg-amber-200/15 text-amber-100 shadow-amber-300/25',
    particle: 'bg-amber-100/70',
  },
  voting: {
    kicker: 'ĐẾN GIỜ PHÁN QUYẾT',
    title: 'Bỏ phiếu',
    description: 'Chọn người bạn nghi ngờ nhất hoặc quyết định bỏ qua.',
    Icon: Vote,
    backdrop: 'bg-gradient-to-br from-red-950/95 via-zinc-950/90 to-black/95',
    card: 'border-red-300/25 bg-zinc-950/75 shadow-red-950/70',
    glow: 'from-red-500/35 via-rose-500/25 to-transparent',
    accent: 'from-red-100 via-rose-200 to-orange-200',
    iconRing: 'border-red-100/35 bg-red-300/10 text-red-100 shadow-red-400/25',
    particle: 'bg-red-100/70',
  },
  conclude: {
    kicker: 'LÁ PHIẾU ĐÃ KHÉP LẠI',
    title: 'Công bố kết quả',
    description: 'Cả làng chờ xem phán quyết cuối cùng của lượt này.',
    Icon: Scale,
    backdrop: 'bg-gradient-to-br from-purple-950/95 via-zinc-950/90 to-black/95',
    card: 'border-purple-200/20 bg-zinc-950/75 shadow-purple-950/70',
    glow: 'from-purple-400/30 via-fuchsia-500/20 to-transparent',
    accent: 'from-purple-100 via-fuchsia-200 to-zinc-100',
    iconRing: 'border-purple-100/35 bg-purple-300/10 text-purple-100 shadow-purple-400/25',
    particle: 'bg-purple-100/70',
  },
}

const floatingParticles = [
  'top-[18%] left-[16%] h-1 w-1',
  'top-[28%] right-[18%] h-1.5 w-1.5',
  'bottom-[30%] left-[24%] h-1.5 w-1.5',
  'right-[28%] bottom-[18%] h-1 w-1',
  'top-[42%] left-[8%] h-1 w-1',
  'top-[58%] right-[10%] h-1.5 w-1.5',
]

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

    const hideTimer = window.setTimeout(() => {
      setVisible(false)
    }, displayMs)
    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current?.()
    }, displayMs + 320)

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
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 28, scale: 0.94 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: slowEaseOut },
        },
        exit: {
          opacity: 0,
          y: -18,
          scale: 1.02,
          transition: { duration: 0.28, ease: slowEaseOut },
        },
      }

  const iconVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delay: 0.1, duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.7, rotate: -8 },
        visible: {
          opacity: 1,
          scale: [0.7, 1.12, 1],
          rotate: [-8, 3, 0],
          transition: { delay: 0.16, duration: 0.7, ease: slowEaseOut },
        },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
      }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={`${phase}-${nonce}`}
          className={`pointer-events-none fixed inset-0 z-[55] flex items-center justify-center overflow-hidden px-5 py-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] ${tone.backdrop}`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            aria-hidden="true"
            className={`absolute inset-x-0 top-1/2 mx-auto h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] ${tone.glow} blur-3xl sm:h-96 sm:w-96`}
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [1, 1.15, 1], opacity: [0.65, 0.9, 0.65] }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 2.4, repeat: Infinity, ease: slowEaseOut }
            }
          />

          {!shouldReduceMotion && (
            <div aria-hidden="true" className="absolute inset-0">
              {floatingParticles.map((particleClass, index) => (
                <motion.span
                  key={particleClass}
                  className={`absolute rounded-full ${tone.particle} ${particleClass}`}
                  animate={{ y: [-8, 10, -8], opacity: [0.25, 0.85, 0.25] }}
                  transition={{
                    duration: 2.4 + index * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.15,
                  }}
                />
              ))}
            </div>
          )}

          <motion.section
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border px-6 py-8 text-center shadow-2xl backdrop-blur-xl ${tone.card}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-x-8 -top-20 h-40 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] ${tone.glow} blur-2xl`}
            />
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_35%,rgba(255,255,255,0.06))]" />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                aria-hidden="true"
                className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full border shadow-2xl ${tone.iconRing}`}
                variants={iconVariants}
              >
                <Icon className="h-10 w-10" strokeWidth={1.7} />
              </motion.div>

              <motion.p
                className="mb-3 text-[0.68rem] font-bold tracking-[0.34em] text-white/55 uppercase"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.28 }}
              >
                {tone.kicker}
              </motion.p>

              <motion.h2
                className={`bg-gradient-to-r ${tone.accent} bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl`}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.35, ease: slowEaseOut }}
              >
                {tone.title}
              </motion.h2>

              <motion.p
                className="mt-4 max-w-xs text-sm leading-6 text-zinc-100/78"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.35, ease: slowEaseOut }}
              >
                {tone.description}
              </motion.p>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PhaseTransitionOverlay
