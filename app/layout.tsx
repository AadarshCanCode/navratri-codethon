import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import AnimatedLayout from '@/components/animated-layout'

export const metadata: Metadata = {
  title: 'VAP AI - Your AI Healthcare Companion',
  description: "VAP AI — AI-powered healthcare assistant tools",
  generator: 'vap-ai',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AnimatedLayout>{children}</AnimatedLayout>
        <Analytics />
      </body>
    </html>
  )
}
