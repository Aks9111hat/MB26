import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth/provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'MindBridge — Find the right mental health support',
    template: '%s | MindBridge',
  },
  description:
    'A 5-minute check-in that matches you with the right therapist, resource, or community. No jargon. No judgment.',
  keywords: ['mental health', 'therapy', 'wellness', 'therapist', 'mental wellness', 'India'],
  authors: [{ name: 'MindBridge' }],
  openGraph: {
    title: 'MindBridge — Find the right mental health support',
    description: 'A 5-minute check-in that matches you with the right therapist, resource, or community.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded via link tag to avoid Next.js font build issues in dev */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
