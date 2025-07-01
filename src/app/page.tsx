'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AVATAR_OPTIONS } from '@/lib/mockAvatar'
import { useRoomStore } from '@/hook/useRoomStore'
import { getInitialsName } from '@/helpers'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const zustandName = useRoomStore((s) => s.username)
  const zustandAvatarKey = useRoomStore((s) => s.avatarKey)
  const setUsername = useRoomStore((s) => s.setUsername)
  const setAvatarKey = useRoomStore((s) => s.setAvatarKey)

  const [step, setStep] = useState<'input' | 'mode'>('input')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<number>(0)

  useEffect(() => {
    if (zustandName) setName(zustandName)
    if (typeof zustandAvatarKey === 'number') setAvatar(zustandAvatarKey)
  }, [zustandName, zustandAvatarKey])

  const handleContinue = () => {
    setUsername(name.trim())
    setAvatarKey(avatar)
    setStep('mode')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-between bg-zinc-900 px-4 py-6">
      <div className="mb-2 gap-2">
        <div className="flex flex-col items-center gap-2 text-center text-4xl font-extrabold tracking-tight text-white">
          <Image
            src="/images/logo/logo.png"
            alt="5Star Wolves"
            width={80}
            height={80}
          />
          <div>
            <span className="text-yellow-400">5S</span>tar Wolves
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

      {/* Center Content */}
      <section className="flex w-full flex-1 flex-col items-center justify-center">
        {step === 'input' && (
          <div className="flex w-full max-w-xs flex-col items-center gap-6">
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="name"
                className="text-base font-semibold text-zinc-200"
              >
                Enter your user name
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
                Choose your avatar
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
                    {opt ? opt : getInitialsName(name)}
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
              Continue
            </Button>
          </div>
        )}
        {step === 'mode' && (
          <div className="mb-6 flex w-full max-w-xs flex-col gap-2">
            <p className="mt-2 max-w-xs text-left text-lg text-zinc-300">
              Choose your game mode
            </p>
            <div className="mt-6 flex w-full flex-col gap-4">
              <Button
                variant="yellow"
                onClick={() => router.push('/join-room')}
                type="button"
              >
                PLAYER MODE
              </Button>
              <Button onClick={() => router.push('/create-room')} type="button">
                GAME MASTER MODE
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Bottom Navigation & Version */}
      <footer className="flex flex-col items-center gap-3">
        <div className="mb-2 flex items-center gap-8">
          <a
            href="#"
            className="flex flex-col items-center text-xs text-zinc-200 transition-colors hover:text-yellow-400"
          >
            <span className="text-xl">📖</span>
            Guidebook
          </a>
          <a
            href="#"
            className="flex flex-col items-center text-xs text-zinc-200 transition-colors hover:text-yellow-400"
          >
            <span className="text-xl">👥</span>
            Terms of usage
          </a>
          <a
            href="#"
            className="flex flex-col items-center text-xs text-zinc-200 transition-colors hover:text-yellow-400"
          >
            <span className="text-xl">🛡️</span>
            Privacy policy
          </a>
        </div>
        <div className="text-center text-xs text-zinc-400">
          VERSION 1.0.3
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
    </main>
  )
}
