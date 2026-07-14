import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported, Messaging } from 'firebase/messaging'
import { firebaseConfig } from './firebase-config'

const app = initializeApp(firebaseConfig)

let messagingPromise: Promise<Messaging | null> | null = null

export function getMessagingInstance() {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => {
        if (!supported) {
          return null
        }

        return getMessaging(app)
      })
      .catch((error) => {
        console.error('Firebase messaging is not available:', error)
        return null
      })
  }

  return messagingPromise
}
