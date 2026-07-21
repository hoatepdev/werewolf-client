'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AVATAR_OPTIONS } from '@/lib/mockAvatar'
import { useRoomStore } from '@/hook/useRoomStore'
import { renderAvatar } from '@/helpers'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { confirmDialog } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()

  const {
    username,
    avatarKey,
    roomCode,
    persistentPlayerId,
    reconnectToken,
    gmPersistentId,
    gmReconnectToken,
    rehydrated,
    setUsername,
    setAvatarKey,
    clearSavedSession,
  } = useRoomStore()

  const [step, setStep] = useState<'input' | 'mode'>('input')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<number>(0)

  useEffect(() => {
    if (username) setName(username)
    if (typeof avatarKey === 'number') setAvatar(avatarKey)
  }, [username, avatarKey])

  const hasPlayerSession = Boolean(
    rehydrated && roomCode && persistentPlayerId && reconnectToken,
  )
  const hasGmSession = Boolean(
    rehydrated && roomCode && gmPersistentId && gmReconnectToken,
  )
  const hasSavedSession = hasPlayerSession || hasGmSession

  const handleContinue = () => {
    setUsername(name.trim())
    setAvatarKey(avatar)
    setStep('mode')
  }

  const handleClearSavedSession = async () => {
    const confirmed = await confirmDialog({
      title: 'Bỏ ván đã lưu?',
      description:
        'Bạn sẽ xóa phiên kết nối lại trên thiết bị này. Nếu ván vẫn đang diễn ra, bạn cần mã phòng hoặc tạo phòng mới để tham gia lại.',
      confirmText: 'Bỏ ván',
      cancelText: 'Giữ lại',
    })

    if (!confirmed) return

    clearSavedSession()
    toast.success('Đã bỏ phiên ván cũ.')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-between bg-zinc-900 px-4 py-6">
      <div className="mb-2 gap-2">
        <div className="flex flex-col items-center gap-2 text-center text-4xl font-extrabold tracking-tight text-white">
          <Image
            src="/images/logo/logo.png"
            alt="Lunar Verdict"
            width={80}
            height={80}
          />
          <div>
            <span className="text-yellow-500">Lunar</span> Verdict
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-2 -mr-8 ml-auto w-fit rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-zinc-900"
        >
          OFFLINE
        </motion.div>
      </div>
      <section className="flex w-full flex-1 flex-col items-center justify-center gap-6">
        {hasSavedSession && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm rounded-2xl border border-yellow-400/40 bg-zinc-950/80 p-4 shadow-lg shadow-yellow-950/30"
          >
            <div className="mb-4">
              <p className="text-lg font-bold text-yellow-400">
                Bạn có ván đang chơi
              </p>
              <div className="mt-2 space-y-1 text-sm text-zinc-300">
                <p>
                  Phòng:{' '}
                  <span className="font-semibold tracking-widest text-white">
                    {roomCode}
                  </span>
                </p>
                {username && (
                  <p>
                    Tên: <span className="font-semibold text-white">{username}</span>
                  </p>
                )}
                <p className="text-xs text-zinc-500">
                  Nếu phòng đã hết hạn, bạn có thể bỏ phiên này và tham gia lại.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {hasPlayerSession && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                  <p className="font-semibold text-zinc-100">
                    Tiếp tục với vai trò người chơi
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Kết nối lại vào phòng cũ bằng phiên đã lưu trên thiết bị này.
                  </p>
                  <Button
                    variant="yellow"
                    className="mt-3 w-full"
                    type="button"
                    onClick={() => router.push(`/room/${roomCode}`)}
                  >
                    Tiếp tục ván
                  </Button>
                </div>
              )}

              {hasGmSession && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                  <p className="font-semibold text-zinc-100">
                    Tiếp tục với vai trò quản trò
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Khôi phục quyền quản trò nếu phòng vẫn còn hoạt động.
                  </p>
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    onClick={() => router.push(`/gm-room/${roomCode}`)}
                  >
                    Vào lại phòng quản trò
                  </Button>
                </div>
              )}

              <button
                type="button"
                onClick={handleClearSavedSession}
                className="text-sm font-medium text-zinc-400 underline-offset-4 hover:text-red-300 hover:underline"
              >
                Bỏ ván này
              </button>
            </div>
          </motion.div>
        )}

        {step === 'input' && (
          <div className="flex w-full max-w-xs flex-col items-center gap-6">
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="name"
                className="text-base font-semibold text-zinc-200"
              >
                Nhập tên người chơi
              </label>
              <Input
                id="name"
                placeholder=""
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                autoFocus
                className="h-12 text-white"
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <span className="mb-1 text-base font-semibold text-zinc-200">
                Chọn avatar của bạn
              </span>
              <div className="flex flex-wrap justify-center gap-3">
                {AVATAR_OPTIONS.map((opt, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold text-white transition-colors focus:outline-none ${
                      avatar === index
                        ? 'border-yellow-400 bg-zinc-800'
                        : 'border-zinc-700 bg-zinc-700 hover:border-zinc-500'
                    }`}
                    onClick={() => setAvatar(index)}
                    aria-label={`Select avatar ${opt}`}
                  >
                    {renderAvatar({ username: name, avatarKey: index })}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="yellow"
              className="mt-6"
              disabled={!name.trim()}
              onClick={handleContinue}
            >
              Lưu & Tiếp tục
            </Button>
          </div>
        )}
        {step === 'mode' && (
          <div className="mb-6 flex w-full max-w-xs flex-col gap-2">
            <p className="mt-2 max-w-xs text-left text-lg text-zinc-300">
              Chọn chế độ chơi
            </p>
            <div className="mt-6 flex w-full flex-col gap-4">
              <Button
                variant="yellow"
                onClick={() => router.push('/join-room')}
                type="button"
              >
                CHẾ ĐỘ NGƯỜI CHƠI
              </Button>
              <Button onClick={() => router.push('/create-room')} type="button">
                CHẾ ĐỘ QUẢN TRÒ
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Bottom Navigation & Version */}
      <Footer />
    </main>
  )
}
