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
  apiKey: '__FIREBASE_API_KEY__',
  authDomain: '__FIREBASE_AUTH_DOMAIN__',
  projectId: '__FIREBASE_PROJECT_ID__',
  storageBucket: '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__FIREBASE_APP_ID__',
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

  const targetUrl = event.notification.data?.url || '/'
  const destination = new URL(targetUrl, self.location.origin).href

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const matchingClient = clientList.find((client) => {
          return client.url === destination && 'focus' in client
        })

        if (matchingClient) {
          return matchingClient.focus()
        }

        if (clients.openWindow) {
          return clients.openWindow(destination)
        }
      }),
  )
})
