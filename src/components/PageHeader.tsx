import React from 'react'
import { useRouter } from 'next/navigation'
import { CornerUpLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PageHeader({
  title,
  right,
  onBack,
  className = '',
}: {
  title: React.ReactNode
  right?: React.ReactNode
  onBack?: () => void
  className?: string
}) {
  const router = useRouter()
  return (
    <header
      className={cn(
        'mb-8 grid min-h-10 w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 border-b border-zinc-800 pb-3',
        className,
      )}
    >
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white active:translate-y-px"
        aria-label="Quay lại"
        onClick={onBack || (() => router.back())}
      >
        <CornerUpLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <h1 className="truncate text-center text-lg font-semibold tracking-tight text-white">
        {title}
      </h1>
      <div className="flex min-w-10 items-center justify-end">{right}</div>
    </header>
  )
}
