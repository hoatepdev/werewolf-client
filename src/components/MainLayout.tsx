import React from 'react'
import { cn } from '@/lib/utils'

export default function MainLayout({
  children,
  maxWidth = 'max-w-3xl',
}: {
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <main
      className={cn(
        'mx-auto flex min-h-dvh w-full flex-col px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] text-zinc-100 sm:px-6 sm:pt-6',
        maxWidth,
      )}
    >
      {children}
    </main>
  )
}
