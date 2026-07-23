'use client'

import { Button } from '@/components/ui/button'
import { usePWAInstallPrompt } from '@/hook/usePWAInstallPrompt'
import { Download, X, Smartphone, Bell, Zap } from 'lucide-react'

export function PWAInstallPrompt() {
  const {
    deferredPrompt,
    dismissPrompt,
    isInstalled,
    promptInstall,
    showInstallPrompt,
  } = usePWAInstallPrompt()

  if (isInstalled || !showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={dismissPrompt}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/30 to-yellow-600/30">
            <Download className="h-6 w-6 text-yellow-300" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="mb-2 text-lg font-bold text-white">
              Cài đặt Ma Sói
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              Cài đặt ứng dụng để mở nhanh hơn và nhận thông báo trong ván chơi
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
              <Bell className="h-4 w-4 text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Thông báo ván chơi</p>
              <p className="text-xs text-zinc-400">
                Nhắc bạn khi có sự kiện quan trọng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-zinc-600/30 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 p-3 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/30 to-purple-600/30">
              <Zap className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Truy cập nhanh</p>
              <p className="text-xs text-zinc-400">Mở game ngay từ màn hình chính</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={promptInstall} variant="yellow" className="flex-1">
            {deferredPrompt ? 'Cài đặt ngay' : 'Hướng dẫn cài đặt'}
          </Button>

          <Button
            variant="black"
            onClick={dismissPrompt}
            className="flex h-12 w-12 transform items-center justify-center rounded-xl border border-zinc-600/50 bg-gradient-to-br from-zinc-800 to-zinc-900 p-0 py-3 shadow-lg transition-all duration-200 hover:scale-105 hover:from-zinc-700 hover:to-zinc-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
