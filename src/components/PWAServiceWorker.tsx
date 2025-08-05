'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/sw-register'

export function PWAServiceWorker() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
}
