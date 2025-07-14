import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ProgrammaticDialogProviderSingleton } from '@/components/ui/alert-dialog'

const tiktokSans = {
  variable: '--font-tiktok-sans',
  style: {
    fontFamily: 'TikTok Sans, ui-sans-serif, system-ui, sans-serif',
  },
}

export const metadata: Metadata = {
  title: '5Star Wolves',
  description: '5Star Wolves',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${tiktokSans.variable} antialiased`}>
      <body>
        <ProgrammaticDialogProviderSingleton>
          <div className="bg-zinc-900">{children}</div>
          <Toaster position="top-center" richColors duration={2000} />
        </ProgrammaticDialogProviderSingleton>
      </body>
    </html>
  )
}
