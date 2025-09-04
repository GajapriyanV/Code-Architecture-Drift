import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { demoMode } from './lib/config'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] })

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
      <body className={jakarta.className}>
          <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
              <div className="container-page">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]"></div>
                    <Link href="/" className="text-xl font-semibold text-white">
                      Drift Detector
                    </Link>
                  </div>
                  <nav className="hidden md:flex items-center gap-6 text-sm">
                    <Link href="/" className="text-zinc-300 hover:text-white">Home</Link>
                    <Link href="/projects" className="text-zinc-300 hover:text-white">Projects</Link>
                    <a
                      href="https://github.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-300 hover:text-white"
                    >Docs</a>
                  </nav>
                  <div className="flex items-center gap-2">
                    {demoMode && (
                      <span className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">Demo Mode</span>
                    )}
                    <Link href="/projects" className="btn-secondary">Browse</Link>
                    <Link href="/projects/new" className="btn-primary">New Project</Link>
                  </div>
                </div>
              </div>
            </header>
            <main className="container-page py-10">{children}</main>
            <footer className="mt-16 py-8 text-center text-sm text-zinc-500">
              Built with Next.js + Tailwind
            </footer>
          </div>
      </body>
    </html>
  )
}
