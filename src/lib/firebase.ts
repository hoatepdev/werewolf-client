import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported, Messaging } from 'firebase/messaging'
import { firebaseConfig } from './firebase-config'

const app = initializeApp(firebaseConfig)

let messaging: Messaging | null = null

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app)
    }
  })
}

export { messaging }
