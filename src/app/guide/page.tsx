'use client'

import MainLayout from '@/components/MainLayout'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { LIST_ROLE } from '@/constants/role'
import { staggerContainerVars, staggerItemVars } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type React from 'react'

const QUICK_STEPS = [
  {
    emoji: '🏠',
    title: 'Tạo hoặc vào phòng',
    desc: 'Quản trò tạo phòng, người chơi tham gia bằng mã phòng hoặc QR.',
  },
  {
    emoji: '🎭',
    title: 'Nhận vai bí mật',
    desc: 'Mỗi người nhận một vai trò riêng. Đừng để lộ nếu chưa có chiến thuật.',
  },
  {
    emoji: '🌙',
    title: 'Đêm xuống',
    desc: 'Sói và các vai đặc biệt âm thầm hành động theo lượt.',
  },
  {
    emoji: '☀️',
    title: 'Ban ngày',
    desc: 'Cả làng thảo luận, nghi ngờ, biện hộ và tìm Sói.',
  },
  {
    emoji: '🗳️',
    title: 'Bỏ phiếu',
    desc: 'Mọi người chọn nghi phạm. Người nhiều phiếu nhất có thể bị loại.',
  },
  {
    emoji: '⚖️',
    title: 'Phán quyết',
    desc: 'Game kiểm tra điều kiện thắng rồi tiếp tục hoặc kết thúc ván.',
  },
]

const PHASES = [
  {
    emoji: '🌙',
    name: 'Đêm',
    desc: 'Các vai trò đặc biệt hành động trong bí mật. Sói chọn nạn nhân, những vai khác cố xoay chuyển số phận.',
    tone: 'border-indigo-400/30 bg-indigo-950/20 text-indigo-200',
  },
  {
    emoji: '☀️',
    name: 'Ngày',
    desc: 'Quản trò công bố kết quả. Cả làng phân tích lời nói, hành vi và những khoảng im lặng đáng ngờ.',
    tone: 'border-yellow-400/30 bg-yellow-950/20 text-yellow-200',
  },
  {
    emoji: '🗳️',
    name: 'Bỏ phiếu',
    desc: 'Mỗi người chọn một nghi phạm hoặc bỏ qua. Lá phiếu là vũ khí mạnh nhất của dân làng.',
    tone: 'border-red-400/30 bg-red-950/20 text-red-200',
  },
  {
    emoji: '⚖️',
    name: 'Kết thúc lượt',
    desc: 'Hệ thống kiểm tra phe thắng, tổng kết kết quả và chuẩn bị vòng ngày đêm tiếp theo.',
    tone: 'border-zinc-500/40 bg-zinc-950/40 text-zinc-200',
  },
]

const ROLE_GUIDE_META: Record<
  string,
  { faction: string; objective: string; tone: string }
> = {
  villager: {
    faction: 'Phe Dân',
    objective: 'Quan sát, tranh luận và tìm Sói bằng suy luận.',
    tone: 'border-emerald-400/30 bg-emerald-950/20 text-emerald-200',
  },
  werewolf: {
    faction: 'Phe Sói',
    objective: 'Ẩn mình, đánh lạc hướng và áp đảo dân làng.',
    tone: 'border-red-400/30 bg-red-950/20 text-red-200',
  },
  seer: {
    faction: 'Phe Dân',
    objective: 'Soi thân phận đúng người rồi truyền đạt khéo léo.',
    tone: 'border-violet-400/30 bg-violet-950/20 text-violet-200',
  },
  witch: {
    faction: 'Phe Dân',
    objective: 'Dùng thuốc cứu hoặc độc đúng thời điểm then chốt.',
    tone: 'border-lime-400/30 bg-lime-950/20 text-lime-200',
  },
  bodyguard: {
    faction: 'Phe Dân',
    objective: 'Bảo vệ người quan trọng và đoán bước đi của Sói.',
    tone: 'border-sky-400/30 bg-sky-950/20 text-sky-200',
  },
  hunter: {
    faction: 'Phe Dân',
    objective: 'Nếu bị hạ, chọn phát súng cuối cùng thật tỉnh táo.',
    tone: 'border-orange-400/30 bg-orange-950/20 text-orange-200',
  },
  tanner: {
    faction: 'Phe riêng',
    objective: 'Khiến cả làng nghi ngờ và bỏ phiếu loại mình.',
    tone: 'border-fuchsia-400/30 bg-fuchsia-950/20 text-fuchsia-200',
  },
  cupid: {
    faction: 'Biến số tình yêu',
    objective: 'Ghép đôi hai người chơi và tạo một bí mật nguy hiểm.',
    tone: 'border-pink-400/30 bg-pink-950/20 text-pink-200',
  },
}

const WIN_CONDITIONS = [
  {
    emoji: '🧑‍🌾',
    faction: 'Dân làng thắng',
    label: 'Loại Sói',
    condition: 'Khi không còn Sói nào sống sót trong làng.',
    tone: 'border-emerald-400/30 bg-emerald-950/20',
  },
  {
    emoji: '🐺',
    faction: 'Sói thắng',
    label: 'Áp đảo',
    condition:
      'Khi số Sói còn sống bằng hoặc vượt số người không phải Sói còn sống.',
    tone: 'border-red-400/30 bg-red-950/20',
  },
  {
    emoji: '😵',
    faction: 'Chán đời thắng',
    label: 'Bị treo cổ',
    condition: 'Khi bị cả làng bỏ phiếu loại trong pha bỏ phiếu.',
    tone: 'border-fuchsia-400/30 bg-fuchsia-950/20',
  },
]

const GM_TIPS = [
  {
    emoji: '⏳',
    title: 'Giữ nhịp ván chơi',
    desc: 'Chuyển pha rõ ràng, cho mọi người đủ thời gian nói và hành động.',
  },
  {
    emoji: '🤫',
    title: 'Bảo mật vai trò',
    desc: 'Đừng để màn hình quản trò hoặc thông tin đêm lộ ra ngoài.',
  },
  {
    emoji: '⚖️',
    title: 'Điều phối công bằng',
    desc: 'Không gợi ý ai là Sói. Chỉ công bố thông tin mà game cho phép.',
  },
  {
    emoji: '🏁',
    title: 'Kết thúc đúng lúc',
    desc: 'Theo dõi điều kiện thắng sau mỗi lượt để công bố phe chiến thắng.',
  },
]

const SURVIVAL_TIPS = [
  'Đừng im lặng quá lâu — Sói thường thích ẩn mình.',
  'Nếu là vai quan trọng, hãy nói vừa đủ để không tự lộ quá sớm.',
  'Theo dõi ai đổi phiếu, ai bênh ai và ai né câu hỏi.',
  'Là Sói, hãy diễn tự nhiên và đừng bảo vệ đồng đội quá lộ.',
]

export default function GuidePage() {
  const router = useRouter()

  const goHome = () => router.push('/')

  return (
    <MainLayout>
      <PageHeader title="Hướng dẫn" />
      <motion.div
        variants={staggerContainerVars}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-10 pb-10"
      >
        <GuideHero />
        <QuickStartActions onStart={goHome} />
        <QuickGuide />
        <PhaseJourney />
        <RoleEncyclopedia />
        <WinConditions />
        <GmGuide />
        <SurvivalTips />
        <FinalCta onStart={goHome} />
      </motion.div>
    </MainLayout>
  )
}

function GuideHero() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      variants={staggerItemVars}
      className="relative overflow-hidden"
    >
      <div className="relative overflow-hidden rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-yellow-950/30 p-5 shadow-2xl shadow-yellow-950/30">
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.35, 0.75, 0.35], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-yellow-300/20 blur-3xl"
        />
        <div className="relative z-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-yellow-200 uppercase">
              Offline party game
            </div>
            <motion.div
              aria-hidden="true"
              animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-4xl drop-shadow-[0_0_18px_rgba(250,204,21,0.45)]"
            >
              🌕
            </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Chào mừng đến với{' '}
              <span className="text-yellow-400">Ma Sói</span>
            </h1>
            <p className="text-base leading-relaxed text-zinc-200">
              Một ngôi làng yên bình, vài con Sói ẩn mình, và những lá phiếu
              quyết định số phận dưới ánh trăng.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Đọc nhanh luật chơi, vai trò, điều kiện thắng và mẹo nhập vai
              trước khi bắt đầu ván đầu tiên.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>3-9 người</Badge>
            <Badge>1 quản trò</Badge>
            <Badge>Chơi offline</Badge>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function QuickStartActions({ onStart }: { onStart: () => void }) {
  return (
    <motion.section variants={staggerItemVars}>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard
          emoji="🎒"
          title="Tôi là người chơi"
          desc="Nhập tên, chọn avatar, rồi tham gia bằng mã phòng từ quản trò."
        />
        <InfoCard
          emoji="🎙️"
          title="Tôi là quản trò"
          desc="Tạo phòng, duyệt người chơi, điều phối pha và giữ bí mật ván đấu."
        />
      </div>
      <div className="mt-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/5 p-4">
        <Button variant="yellow" type="button" onClick={onStart}>
          Nhập tên để bắt đầu
        </Button>
        <p className="mt-3 text-center text-xs leading-relaxed text-zinc-300">
          Bạn sẽ nhập tên, chọn avatar rồi chọn chế độ người chơi/quản trò.
        </p>
      </div>
    </motion.section>
  )
}

function QuickGuide() {
  return (
    <motion.section variants={staggerItemVars} className="space-y-4">
      <SectionTitle
        eyebrow="Luật nhanh"
        title="Cách chơi trong 60 giây"
        desc="Ma Sói là cuộc chiến giữa suy luận, diễn xuất và một chút phản bội đúng lúc."
      />
      <div className="relative space-y-3 before:absolute before:top-8 before:bottom-8 before:left-6 before:w-px before:bg-yellow-400/25">
        {QUICK_STEPS.map((step, index) => (
          <TimelineItem key={step.title} step={step} index={index} />
        ))}
      </div>
    </motion.section>
  )
}

function PhaseJourney() {
  return (
    <motion.section variants={staggerItemVars} className="space-y-4">
      <SectionTitle
        eyebrow="Nhịp ván đấu"
        title="Vòng lặp ngày và đêm"
        desc="Mỗi vòng chơi đưa cả làng qua bí mật, tranh luận, bỏ phiếu và phán quyết."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {PHASES.map((phase, index) => (
          <GuideCard key={phase.name} className={cn('p-4', phase.tone)}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-3xl leading-none" aria-hidden="true">
                {phase.emoji}
              </span>
              <span className="rounded-full bg-black/25 px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
                Pha {index + 1}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{phase.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {phase.desc}
            </p>
          </GuideCard>
        ))}
      </div>
    </motion.section>
  )
}

function RoleEncyclopedia() {
  return (
    <motion.section variants={staggerItemVars} className="space-y-4">
      <SectionTitle
        eyebrow="Vai trò"
        title="Ai đang đứng dưới ánh trăng?"
        desc="Mỗi vai có mục tiêu riêng. Đẹp nhất là khi bạn biết mình cần giấu điều gì."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {LIST_ROLE.map((role) => {
          const meta = ROLE_GUIDE_META[role.id] ?? {
            faction: 'Bí mật',
            objective: role.description,
            tone: 'border-zinc-700 bg-zinc-950/40 text-zinc-200',
          }

          return (
            <GuideCard key={role.id} className={cn('p-4', meta.tone)}>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/25 text-2xl shadow-inner shadow-black/30">
                  <span aria-hidden="true">{role.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{role.name}</h3>
                    <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      {meta.faction}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {role.description}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                    {meta.objective}
                  </p>
                </div>
              </div>
            </GuideCard>
          )
        })}
      </div>
    </motion.section>
  )
}

function WinConditions() {
  return (
    <motion.section variants={staggerItemVars} className="space-y-4">
      <SectionTitle
        eyebrow="Mục tiêu"
        title="Điều kiện thắng"
        desc="Không phải ai cũng muốn sống sót. Đôi khi bị nghi ngờ lại là chiến thắng."
      />
      <div className="grid gap-3">
        {WIN_CONDITIONS.map((wc) => (
          <GuideCard key={wc.faction} className={cn('p-4', wc.tone)}>
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none" aria-hidden="true">
                {wc.emoji}
              </span>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-white">{wc.faction}</h3>
                  <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-200 uppercase">
                    {wc.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {wc.condition}
                </p>
              </div>
            </div>
          </GuideCard>
        ))}
      </div>
    </motion.section>
  )
}

function GmGuide() {
  return (
    <motion.section variants={staggerItemVars} className="space-y-4">
      <SectionTitle
        eyebrow="GM checklist"
        title="Dành cho quản trò"
        desc="Quản trò là người giữ nhịp, giữ bí mật và giữ cho cả bàn chơi công bằng."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {GM_TIPS.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                {tip.emoji}
              </span>
              <h3 className="font-bold text-white">{tip.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">{tip.desc}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

function SurvivalTips() {
  return (
    <motion.section variants={staggerItemVars} className="space-y-4">
      <SectionTitle
        eyebrow="Mẹo nhỏ"
        title="Sống sót qua đêm đầu tiên"
        desc="Không có công thức thắng tuyệt đối, nhưng vài thói quen tốt sẽ giúp bạn đáng tin hơn."
      />
      <div className="flex flex-col gap-2">
        {SURVIVAL_TIPS.map((tip, index) => (
          <div
            key={tip}
            className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-zinc-950">
              {index + 1}
            </span>
            <p className="text-sm leading-relaxed text-zinc-300">{tip}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <motion.section variants={staggerItemVars}>
      <div className="overflow-hidden rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/15 via-zinc-950 to-zinc-950 p-5 text-center shadow-2xl shadow-yellow-950/20">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/15 text-3xl">
          <span aria-hidden="true">🌙</span>
        </div>
        <h2 className="text-xl font-black text-white">
          Sẵn sàng phán quyết dưới ánh trăng?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Rủ bạn bè, tạo phòng và bắt đầu ván Ma Sói đầu tiên.
        </p>
        <Button
          variant="yellow"
          type="button"
          onClick={onStart}
          className="mt-5"
        >
          Nhập tên để bắt đầu
        </Button>
      </div>
    </motion.section>
  )
}

function TimelineItem({
  step,
  index,
}: {
  step: (typeof QUICK_STEPS)[number]
  index: number
}) {
  return (
    <GuideCard className="relative ml-4 border-zinc-800 bg-zinc-950/70 p-4 pl-14">
      <div className="absolute top-4 left-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-yellow-400/40 bg-zinc-950 text-lg shadow-lg shadow-yellow-950/20">
        <span aria-hidden="true">{step.emoji}</span>
      </div>
      <span className="mb-2 inline-flex rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-yellow-300 uppercase">
        Bước {index + 1}
      </span>
      <h3 className="font-bold text-white">{step.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-300">{step.desc}</p>
    </GuideCard>
  )
}

function InfoCard({
  emoji,
  title,
  desc,
}: {
  emoji: string
  title: string
  desc: string
}) {
  return (
    <GuideCard className="border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400/10 text-2xl">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{desc}</p>
    </GuideCard>
  )
}

function GuideCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={staggerItemVars}
      className={cn(
        'rounded-2xl border shadow-lg shadow-black/20 backdrop-blur',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string
  title: string
  desc: string
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.2em] text-yellow-300 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-black text-yellow-400">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{desc}</p>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-700/70 bg-zinc-950/60 px-2 py-2 text-center text-[10px] font-bold text-zinc-200">
      {children}
    </span>
  )
}
