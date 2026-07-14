import { useCallback, useEffect, useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallPromptState {
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstalled: boolean
  isMobile: boolean
  showInstallPrompt: boolean
}

const installInstructions = `
Để cài đặt ứng dụng:

 iOS (Safari):
1. Nhấn vào biểu tượng chia sẻ (□↑)
2. Chọn "Thêm vào Màn hình chính"

Android (Chrome):
1. Nhấn vào menu (⋮)
2. Chọn "Cài đặt ứng dụng"
`

let state: PWAInstallPromptState = {
  deferredPrompt: null,
  isInstalled: false,
  isMobile: false,
  showInstallPrompt: false,
}

let initialized = false
let showPromptTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<() => void>()

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

const setState = (nextState: Partial<PWAInstallPromptState>) => {
  state = { ...state, ...nextState }
  emitChange()
}

const getSnapshot = () => state

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const isStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches
}

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

const isDismissed = () => {
  return localStorage.getItem('pwa-prompt-dismissed') === 'true'
}

const updateInstalledState = () => {
  const installed =
    isStandaloneMode() || localStorage.getItem('pwa-installed') === 'true'

  setState({ isInstalled: installed })
  return installed
}

const initializeInstallPrompt = () => {
  if (initialized || typeof window === 'undefined') return

  initialized = true

  const mobile = isMobileDevice()
  const installed = updateInstalledState()
  setState({ isMobile: mobile })

  if (mobile && !installed && !isDismissed()) {
    showPromptTimer = setTimeout(() => {
      setState({ showInstallPrompt: true })
    }, 2000)
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    setState({ deferredPrompt: event as BeforeInstallPromptEvent })

    if (!isDismissed()) {
      setState({ showInstallPrompt: true })
    }
  })

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa-installed', 'true')
    localStorage.removeItem('pwa-prompt-dismissed')

    if (showPromptTimer) {
      clearTimeout(showPromptTimer)
      showPromptTimer = null
    }

    setState({
      deferredPrompt: null,
      isInstalled: true,
      showInstallPrompt: false,
    })
  })
}

export function usePWAInstallPrompt() {
  const installPromptState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  )

  useEffect(() => {
    initializeInstallPrompt()
  }, [])

  const promptInstall = useCallback(async () => {
    if (installPromptState.deferredPrompt) {
      installPromptState.deferredPrompt.prompt()
      const { outcome } = await installPromptState.deferredPrompt.userChoice

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true')
        localStorage.removeItem('pwa-prompt-dismissed')
        setState({ isInstalled: true })
      }

      setState({ deferredPrompt: null, showInstallPrompt: false })
      return outcome
    }

    if (installPromptState.isMobile) {
      alert(installInstructions)
      localStorage.removeItem('pwa-prompt-dismissed')
    } else {
      alert('Trình duyệt của bạn không hỗ trợ cài đặt PWA')
    }

    setState({ showInstallPrompt: false })
    return 'dismissed' as const
  }, [installPromptState.deferredPrompt, installPromptState.isMobile])

  const dismissPrompt = useCallback(() => {
    localStorage.setItem('pwa-prompt-dismissed', 'true')
    setState({ showInstallPrompt: false })
  }, [])

  const showPrompt = useCallback(() => {
    if (!installPromptState.isInstalled) {
      setState({ showInstallPrompt: true })
    }
  }, [installPromptState.isInstalled])

  return {
    ...installPromptState,
    dismissPrompt,
    promptInstall,
    showPrompt,
  }
}
