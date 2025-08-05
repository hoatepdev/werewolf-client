'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Wifi, Zap } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkInstallation = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches
      const isInstalled = localStorage.getItem('pwa-installed') === 'true'

      if (isStandalone || isInstalled) {
        setIsInstalled(true)
        return
      }

      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
      setIsMobile(isMobileDevice)

      if (isMobileDevice) {
        const hasShownPrompt = localStorage.getItem('pwa-prompt-shown')
        if (!hasShownPrompt) {
          setTimeout(() => {
            setShowInstallPrompt(true)
            localStorage.setItem('pwa-prompt-shown', 'true')
          }, 2000)
        }
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
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
      }
    }

    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  if (isInstalled || !showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleDismiss}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 text-lg font-bold text-white">
              Cài đặt 5Star Wolves Offline
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              Cài đặt ứng dụng để có trải nghiệm tốt hơn và chơi offline
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-600/30 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 p-3 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/30 to-blue-600/30">
              <Smartphone className="h-4 w-4 text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Trải nghiệm tốt hơn
              </p>
              <p className="text-xs text-zinc-400">
                Giao diện tối ưu cho mobile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-zinc-600/30 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 p-3 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/20 bg-gradient-to-br from-green-500/30 to-green-600/30">
              <Wifi className="h-4 w-4 text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Chơi offline</p>
              <p className="text-xs text-zinc-400">
                Không cần kết nối internet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-zinc-600/30 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 p-3 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/30 to-purple-600/30">
              <Zap className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Tải nhanh hơn</p>
              <p className="text-xs text-zinc-400">Truy cập tức thì</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleInstall} variant="yellow" className="flex-1">
            {deferredPrompt ? 'Cài đặt ngay' : 'Hướng dẫn cài đặt'}
          </Button>

          <Button
            variant="black"
            onClick={handleDismiss}
            className="flex h-12 w-12 transform items-center justify-center rounded-xl border border-zinc-600/50 bg-gradient-to-br from-zinc-800 to-zinc-900 p-0 shadow-lg transition-all duration-200 hover:scale-105 hover:from-zinc-700 hover:to-zinc-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
