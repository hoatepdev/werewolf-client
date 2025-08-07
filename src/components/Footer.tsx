'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function Footer() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkInstallation = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches
      const isInstalled = localStorage.getItem('pwa-installed') === 'true'

      if (isStandalone || isInstalled) {
        setIsInstalled(true)
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    checkInstallation()

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
        localStorage.setItem('pwa-installed', 'true')
      }

      setDeferredPrompt(null)
    } else {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )

      if (isMobile) {
        const installInstructions = `
          Để cài đặt ứng dụng:
          
          iOS (Safari):
          1. Nhấn vào biểu tượng chia sẻ (□↑)
          2. Chọn "Thêm vào Màn hình chính"
          
          Android (Chrome):
          1. Nhấn vào menu (⋮)
          2. Chọn "Cài đặt ứng dụng"
        `
        alert(installInstructions)
      } else {
        alert('Trình duyệt của bạn không hỗ trợ cài đặt PWA')
      }
    }
  }

  return (
    <footer className="flex w-full flex-col items-center gap-3">
      <div className="mb-2 flex w-full items-center justify-evenly gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // router.push('/guide')
            alert('Hướng dẫn sẽ được cập nhật trong thời gian sớm nhất')
          }}
          className="flex items-center gap-2 text-center text-sm text-zinc-200 transition-colors hover:text-yellow-400"
        >
          <span className="text-xl">📖</span>
          Hướng dẫn
        </motion.button>
        {!isInstalled && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstall}
            className="flex items-center gap-2 text-center text-sm text-zinc-200 transition-colors hover:text-yellow-400"
          >
            <span className="text-xl">📱</span>
            Tải App
          </motion.button>
        )}
      </div>
      <div className="text-center text-xs text-zinc-400">
        VERSION 1.0.1
        <br />
        Powered by:{' '}
        <a
          href="https://www.p.hoatepdev.site"
          target="_blank"
          className="text-yellow-400"
        >
          hoatep
        </a>
      </div>
    </footer>
  )
}
