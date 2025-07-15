import React from 'react'
import { useRouter } from 'next/navigation'
import { CornerUpLeft } from 'lucide-react'

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
    <div
      className={`mb-6 flex h-10 w-full items-center justify-between ${className}`}
    >
      <button
        className="mr-2 text-2xl text-white hover:text-gray-400"
        aria-label="Quay lại"
        onClick={onBack || (() => router.back())}
      >
        <CornerUpLeft className="h-6 w-6 cursor-pointer text-gray-400" />
      </button>
      <h1 className="ml-2 text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  )
}
