importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
)
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
)

const CACHE_NAME = 'werewolf-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/logo/logo.png',
]

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)

if (hasFirebaseConfig) {
  firebase.initializeApp(firebaseConfig)

  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'New Message'
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new message',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: payload.data,
    }

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions,
    )
  })
} else {
  console.warn('Firebase config is incomplete. Background messaging is disabled.')
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const notificationData = event.notification.data || {}
  const targetUrl = notificationData.url || '/'
  const destination = new URL(targetUrl, self.location.origin).href
  const clickMessage = {
    type: 'WEREWOLF_NOTIFICATION_CLICK',
    url: targetUrl,
    roomCode: notificationData.roomCode,
    participantKind: notificationData.participantKind,
    snapshotHint: notificationData.snapshotHint,
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (clientList) => {
        const matchingClient = clientList.find((client) => {
          return client.url === destination && 'focus' in client
        })

        if (matchingClient) {
          matchingClient.postMessage(clickMessage)
          return matchingClient.focus()
        }

        const sameOriginClient = clientList.find(
          (client) =>
            new URL(client.url).origin === self.location.origin &&
            'focus' in client,
        )

        if (sameOriginClient) {
          sameOriginClient.postMessage(clickMessage)
          if ('navigate' in sameOriginClient) {
            const navigatedClient = await sameOriginClient.navigate(destination)
            return navigatedClient?.focus()
          }
          return sameOriginClient.focus()
        }

        if (clients.openWindow) {
          return clients.openWindow(destination)
        }
      }),
  )
})
