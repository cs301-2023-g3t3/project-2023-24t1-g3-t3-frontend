import './globals.css'
import type { Metadata } from 'next'
import Provider from './context/client-provider'
import { Inter } from 'next/font/google'
import { auth } from './api/auth/auth'
import Forbidden from './components/Forbidden'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin System',
  description: 'CS301 Project - G3T3',
}

export default async function RootLayout({children,}: {children: React.ReactNode}) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <Provider session={session}>
          {children}
        </Provider>
      </body>
    </html>
  )
}

