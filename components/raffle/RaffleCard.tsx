'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Calendar, Users, Trophy, ChevronRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Raffle {
  id: string
  title: string
  description?: string | null
  prizeDescription?: string | null
  winnerCount: number
  totalEntries: number
  commitTimestamp: number
  drawn: boolean
  createdAt: string
}

interface RaffleCardProps {
  raffle: Raffle
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const formattedDate = new Date(raffle.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300"
    >
      {/* Dynamic Animated Sweeping Conic Border Hover Effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/5 to-white/5 rounded-2xl group-hover:bg-none" />
      <div className="absolute inset-[-100%] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{
             background: 'conic-gradient(from 0deg, transparent 20%, #ffb300 45%, #f59e0b 55%, transparent 80%)',
             animation: 'orbital-spin 4s linear infinite',
           }} />

      <style>{`
        @keyframes orbital-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main card background */}
      <div className="glass-card h-full p-5 flex flex-col justify-between relative overflow-hidden bg-slate-950/80 rounded-2xl">
        {/* Futuristic Cyber Corner Lines */}
        <div className="absolute top-0 left-0 w-3 h-[1px] bg-white/10 group-hover:bg-solar-amber transition-colors" />
        <div className="absolute top-0 left-0 w-[1px] h-3 bg-white/10 group-hover:bg-solar-amber transition-colors" />
        <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-white/10 group-hover:bg-hyper-indigo transition-colors" />
        <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-white/10 group-hover:bg-hyper-indigo transition-colors" />

        {/* Ambient backing gradient on hover */}
        <div className="absolute -inset-10 -z-10 bg-gradient-to-r from-solar-amber/10 to-hyper-indigo/10 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono font-semibold tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-amber-500/40" />
              {formattedDate}
            </span>
            
            {raffle.drawn ? (
              <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs tracking-widest uppercase font-mono shadow-[0_0_10px_rgba(16,185,129,0.06)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Drawn
              </Badge>
            ) : (
              <Badge className="bg-amber-950/40 text-solar-amber border border-solar-amber/20 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs tracking-widest uppercase font-mono shadow-[0_0_10px_rgba(245,158,11,0.06)]">
                <span className="h-1.5 w-1.5 rounded-full bg-solar-amber animate-ping" style={{ animationDuration: '2s' }} />
                Active
              </Badge>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-200 group-hover:text-solar-amber transition-colors duration-200 line-clamp-1 leading-snug">
            {raffle.title}
          </h3>

          {raffle.drawn && (
            <div className="mt-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-solar-amber animate-pulse" />
              <span className="text-xs text-solar-amber font-mono font-bold tracking-widest uppercase glow-text-amber">cTRNG Seed Verified</span>
            </div>
          )}

          {raffle.prizeDescription && (
            <p className="mt-3.5 text-xs text-solar-amber font-semibold flex items-center gap-2 bg-solar-amber/5 px-2.5 py-1.5 rounded-xl border border-solar-amber/15 shadow-[inset_0_0_10px_rgba(245,158,11,0.02)]">
              <Trophy className="h-3.5 w-3.5 shrink-0 text-solar-amber animate-pulse" />
              <span className="truncate">{raffle.prizeDescription}</span>
            </p>
          )}

          {raffle.description && (
            <p className="mt-3.5 text-xs text-slate-400 line-clamp-2 leading-relaxed h-8 font-medium">
              {raffle.description}
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-600" />
              <span><strong>{raffle.totalEntries}</strong> entries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-slate-600" />
              <span><strong>{raffle.winnerCount}</strong> winners</span>
            </div>
          </div>
          
          <Link
            href={`/raffle/${raffle.id}`}
            className="flex items-center gap-0.5 text-solar-amber font-bold uppercase tracking-wider text-xs group-hover:text-amber-300 transition-colors group-hover:glow-text-amber"
          >
            Launch console
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
