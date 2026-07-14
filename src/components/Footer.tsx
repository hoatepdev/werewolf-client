'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePWAInstallPrompt } from '@/hook/usePWAInstallPrompt'

export default function Footer() {
  const router = useRouter()
  const { isInstalled, promptInstall } = usePWAInstallPrompt()

  return (
    <footer className="flex w-full flex-col items-center gap-3">
      <div className="mb-2 flex w-full items-center justify-evenly gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/guide')}
          className="flex items-center gap-2 text-center text-sm text-zinc-200 transition-colors hover:text-yellow-400"
        >
          <span className="text-xl">📖</span>
          Hướng dẫn
        </motion.button>
        {!isInstalled && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={promptInstall}
            className="flex items-center gap-2 text-center text-sm text-zinc-200 transition-colors hover:text-yellow-400"
          >
            <span className="text-xl">📱</span>
            Tải App
          </motion.button>
        )}
      </div>
      <div className="text-center text-xs text-zinc-400">
        VERSION 1.5.2
        <br />
        Powered by:{' '}
        <a
          href="https://p.hoatepdev.site/"
          target="_blank"
          className="text-yellow-400 transition-colors hover:text-yellow-500"
        >
          hoatepdev
        </a>
      </div>
    </footer>
  )
}
