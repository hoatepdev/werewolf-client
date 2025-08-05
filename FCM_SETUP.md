# Firebase Cloud Messaging (FCM) Setup

## Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Cloud Messaging in your Firebase project

## Configuration Steps

### 1. Get Firebase Configuration

1. Go to your Firebase project console
2. Click on the gear icon (⚙️) next to "Project Overview"
3. Select "Project settings"
4. Scroll down to "Your apps" section
5. Click "Add app" and select "Web" (</>) if you haven't already
6. Register your app and copy the configuration object

### 2. Set Up Environment Variables

1. Copy the environment template:

   ```bash
   cp env.example .env
   ```

2. Update `.env` with your Firebase configuration values:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase VAPID Key for Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-generated-vapid-key
```

### 3. Generate VAPID Key

1. In Firebase Console, go to Project Settings
2. Click on the "Cloud Messaging" tab
3. Scroll down to "Web configuration" section
4. Click "Generate key pair" under "Web Push certificates"
5. Copy the generated key and add it to your `.env.local` file

### 4. Service Worker Configuration

The service worker will automatically be updated with your environment variables during the build process. No manual configuration needed.

## Testing

1. Start your development server: `npm run start:dev`
2. Navigate to `/fcm-test` to test the FCM integration
3. Click "Enable Notifications" to request permission
4. Copy the FCM token from the console or the UI
5. Use the FCM token to send test notifications from Firebase Console

## Sending Test Notifications

1. In Firebase Console, go to "Cloud Messaging"
2. Click "Send your first message"
3. Fill in the notification details
4. In "Target" section, select "Single device" and paste your FCM token
5. Send the message

## Features Implemented

- ✅ Firebase initialization
- ✅ Service worker for background notifications
- ✅ Permission request handling
- ✅ FCM token retrieval and display
- ✅ Foreground notification handling with toast
- ✅ Background notification handling
- ✅ Copy token functionality
- ✅ Permission status display

## Files Created/Modified

- `src/lib/firebase-config.js` - Firebase configuration using environment variables
- `src/lib/firebase.js` - Firebase initialization
- `public/sw.js` - Updated service worker with Firebase messaging support
- `src/hook/useFCM.ts` - Custom hook for FCM functionality
- `src/components/FCMNotification.tsx` - UI component for FCM
- `src/app/fcm-test/page.tsx` - Test page
- `scripts/build-sw.js` - Build script to inject environment variables into service worker
- `next.config.ts` - Updated for service worker headers
- `package.json` - Added Firebase dependency and build scripts
- `env.example` - Environment variables template

## Usage in Your App

To use FCM in any component:

```typescript
import { useFCM } from '../hook/useFCM'

function MyComponent() {
  const { token, permission, requestPermission } = useFCM()

  // Use the FCM functionality
}
```
