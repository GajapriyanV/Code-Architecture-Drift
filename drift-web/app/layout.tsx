import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ApolloWrapper from './components/ApolloWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Architecture Drift Detector',
  description: 'Prevent architecture drift by comparing your intended design to the actual codebase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">
                        Drift Detector
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </ApolloWrapper>
      </body>
    </html>
  )
}
