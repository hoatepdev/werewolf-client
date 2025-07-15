import React from 'react'

export default function MainLayout({
  children,
  maxWidth = 'max-w-3xl',
}: {
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <main
      className={`mx-auto flex min-h-screen ${maxWidth} flex-col bg-zinc-900 px-4 py-6 text-white`}
    >
      {children}
    </main>
  )
}
