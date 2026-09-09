'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePWAInstallPrompt } from '@/hook/usePWAInstallPrompt'
import { Download } from 'lucide-react'

export function PWAInstallPrompt() {
  const {
    deferredPrompt,
    dismissPrompt,
    isInstalled,
    promptInstall,
    showInstallPrompt,
  } = usePWAInstallPrompt()

  if (isInstalled || !showInstallPrompt) return null

  return (
    <Dialog open onOpenChange={(open) => !open && dismissPrompt()}>
      <DialogContent className="border-yellow-400/40 bg-zinc-950">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center border-l-2 border-yellow-400 bg-yellow-400/10">
            <Download className="h-5 w-5 text-yellow-300" aria-hidden="true" />
          </div>
          <DialogTitle>Cài đặt Ma Sói</DialogTitle>
          <DialogDescription className="max-w-[42ch] leading-6">
            Mở game nhanh từ màn hình chính và nhận thông báo khi ván chơi có
            sự kiện quan trọng.
          </DialogDescription>
        </DialogHeader>

        <div className="border-y border-zinc-800 py-4 text-sm leading-6 text-zinc-300">
          Ứng dụng được tối ưu cho điện thoại và hoạt động như một PWA. Bạn có
          thể gỡ cài đặt bất cứ lúc nào từ thiết bị.
        </div>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="button" onClick={promptInstall} variant="yellow">
            {deferredPrompt ? 'Cài đặt ngay' : 'Xem hướng dẫn cài đặt'}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="black">
              Để sau
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
