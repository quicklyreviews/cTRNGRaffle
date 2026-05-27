'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, Menu, ShieldAlert, ShieldCheck, X, Cpu, Radio, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const NAV = [
  { label: 'Raffles', href: '/', glyph: '🛰️', match: (p: string) => p === '/' || p.startsWith('/raffle') },
  { label: 'Create Campaign', href: '/create', glyph: '⚡', match: (p: string) => p === '/create' },
]

export function MainHeader() {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const json = await res.json()
      setIsAdmin(!!json.user?.isAdmin)
    } catch {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAdmin(false)
    router.refresh()
  }

  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.05] bg-space-950/40 px-4 backdrop-blur-md sm:px-6">
      {/* Dynamic ambient header glow */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-solar-amber/20 to-transparent" />

      {/* Left: Logo & Nav */}
      <div className="flex min-w-0 items-center gap-4 sm:gap-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          {/* Advanced Orbiting logo mark */}
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* Ambient Back Glow */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-solar-amber to-hyper-indigo opacity-20 blur-md group-hover:opacity-40"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Main Badge */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 font-bold text-white shadow-md">
              <span className="bg-gradient-to-r from-solar-amber to-hyper-indigo bg-clip-text text-sm font-extrabold text-transparent">cT</span>
            </div>

            {/* Orbit Path 1 (Concentric Circle) */}
            <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none scale-125" />
            {/* Orbiting Satellite Dot 1 */}
            <motion.div
              className="absolute h-1.5 w-1.5 rounded-full bg-solar-amber shadow-[0_0_8px_#ffb300]"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ top: -4, left: '50%', transformOrigin: '0 24px' }}
            />

            {/* Orbit Path 2 */}
            <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none scale-[1.5] opacity-50" />
            {/* Orbiting Satellite Dot 2 (Counter-spin) */}
            <motion.div
              className="absolute h-1 w-1 rounded-full bg-hyper-indigo shadow-[0_0_6px_#f59e0b]"
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ top: -8, left: '50%', transformOrigin: '0 28px' }}
            />
          </div>

          <span className="bg-gradient-to-r from-slate-100 via-amber-100 to-solar-amber bg-clip-text font-[var(--font-space)] text-sm font-bold uppercase tracking-widest text-transparent sm:text-base">
            cTRNG <span className="text-solar-amber font-black">Raffle</span>
          </span>
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden items-center gap-1.5 text-base lg:flex">
          {NAV.map((it) => {
            const isActive = it.match ? it.match(pathname) : pathname === it.href
            return (
              <Link
                key={it.label}
                href={it.href}
                className="relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.04] border border-white/[0.05] shadow-[0_0_12px_rgba(245,158,11,0.06)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                  {it.glyph}
                </span>
                <span className={`relative z-10 font-bold ${isActive ? 'text-solar-amber glow-text-amber' : 'text-slate-400 hover:text-slate-200'}`}>
                  {it.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right: Security & Admin Status Console */}
      <div className="flex items-center gap-3">
        {isAdmin ? (
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            {/* Decrypted administrative session widget */}
            <span className="hidden items-center gap-2 rounded-xl border border-solar-amber/20 bg-solar-amber/5 px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-solar-amber shadow-[0_0_15px_rgba(245,158,11,0.08)] backdrop-blur-md sm:flex font-mono">
              <Key className="h-3.5 w-3.5 text-solar-amber animate-pulse" />
              <span>KMS_CLEARANCE: DECRYPTED</span>
            </span>
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-950/30 px-3.5 py-1.5 text-sm font-bold uppercase tracking-wider text-rose-350 backdrop-blur-md transition-colors hover:bg-rose-500/20 hover:text-white"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <LogOut className="h-3 w-3" />
              Exit Session
            </motion.button>
          </motion.div>
        ) : (
          /* Public telemetry sync widget */
          <span className="hidden items-center gap-2 rounded-xl border border-solar-amber/10 bg-amber-950/20 px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-solar-amber shadow-[0_0_12px_rgba(245,158,11,0.04)] backdrop-blur-md sm:flex font-mono">
            <Radio className="h-3.5 w-3.5 text-solar-amber animate-pulse" />
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Ground Sync Active</span>
          </span>
        )}

        {/* Mobile menu trigger */}
        <motion.button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white lg:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Mobile slide navigation menu */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-space-950/95 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Mobile header console */}
            <motion.div
              className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3.5 backdrop-blur-xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.05 }}
            >
              <span className="text-xs font-mono font-bold tracking-widest text-solar-amber">TELEMETRY_MENU.EXE</span>
              <motion.button
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/5 text-white/60 hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Mobile nav links */}
            <nav className="flex flex-1 flex-col gap-2.5 p-4">
              {NAV.map((it, i) => {
                const isActive = it.match ? it.match(pathname) : pathname === it.href
                return (
                  <motion.div
                    key={it.label}
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.06 * (i + 1) }}
                  >
                    <Link
                      href={it.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                        isActive
                          ? 'bg-gradient-to-r from-solar-amber/10 to-hyper-indigo/10 text-white border border-solar-amber/20 shadow-[0_0_16px_rgba(245,158,11,0.06)]'
                          : 'bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>{it.glyph}</span>
                      <span>{it.label}</span>
                    </Link>
                  </motion.div>
                )
              })}

              {isAdmin && (
                <motion.button
                  onClick={() => {
                    handleLogout()
                    setMobileNavOpen(false)
                  }}
                  className="mt-auto flex items-center gap-3.5 rounded-xl border border-rose-500/20 bg-rose-950/20 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-rose-350 backdrop-blur-sm hover:bg-rose-500/20"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.25 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Exit Session</span>
                </motion.button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
