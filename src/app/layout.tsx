import type { Metadata } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ProgrammaticDialogProviderSingleton } from '@/components/ui/alert-dialog'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

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
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
    >
      <body>
        <ProgrammaticDialogProviderSingleton>
          <div className="bg-zinc-900">{children}</div>
          <Toaster position="top-center" richColors duration={2000} />
        </ProgrammaticDialogProviderSingleton>
      </body>
    </html>
  )
}
