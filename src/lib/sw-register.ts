export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  const register = () => {
    return navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
        return registration
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
        return undefined
      })
  }

  if (document.readyState === 'complete') {
    return register()
  }

  return new Promise<ServiceWorkerRegistration | undefined>((resolve) => {
    window.addEventListener('load', () => resolve(register()), { once: true })
  })
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
