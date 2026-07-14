import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ProgrammaticDialogProviderSingleton } from '@/components/ui/alert-dialog'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { PWAServiceWorker } from '@/components/PWAServiceWorker'
import { BackgroundEngine } from '@/components/game/background/BackgroundEngine'

const tiktokSans = {
  variable: '--font-tiktok-sans',
  style: {
    fontFamily: 'TikTok Sans, ui-sans-serif, system-ui, sans-serif',
  },
}

export const metadata: Metadata = {
  title: 'Lunar Verdict Offline',
  description:
    'Chơi ma sói với bạn bè. Tạo phòng, tham gia và chơi cùng bạn bè.',
  keywords: [
    'ma sói',
    'werewolf',
    'game',
    'online',
    'multiplayer',
    'board game',
  ],
  authors: [{ name: 'hoatepdev' }],
  creator: 'hoatepdev',
  publisher: 'hoatepdev',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://werewolf-client-beta.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lunar Verdict Offline',
    description: 'Chơi ma sói với bạn bè',
    url: 'https://werewolf-client-beta.vercel.app',
    siteName: 'Lunar Verdict Offline',
    images: [
      {
        url: '/images/logo/logo.png',
        width: 512,
        height: 512,
        alt: 'Lunar Verdict Offline Logo',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunar Verdict Offline',
    description: 'Chơi ma sói với bạn bè',
    images: ['/images/logo/logo.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lunar Verdict Offline',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Lunar Verdict Offline',
    'msapplication-TileColor': '#18181b',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#18181b',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={`${tiktokSans.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Lunar Verdict Offline"
        />
        <meta name="msapplication-TileColor" content="#18181b" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />
      </head>
      <body>
        <ProgrammaticDialogProviderSingleton>
          <BackgroundEngine />
          <div className="bg-zinc-900">{children}</div>
          <Toaster position="top-center" richColors duration={2000} />
          <PWAInstallPrompt />
          <PWAServiceWorker />
        </ProgrammaticDialogProviderSingleton>
      </body>
    </html>
  )
}
