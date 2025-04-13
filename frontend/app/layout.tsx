import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HC and LO Feedback Summarizer',
  description: 'A platform for viewing and analyzing Minervans feedback data from Forum',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
