import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'LevelUP',
  description: 'Closed-loop autoregulation engine for strength athletes',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  )
}
