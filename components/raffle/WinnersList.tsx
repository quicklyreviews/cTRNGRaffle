'use client'

import { useEffect, useState } from 'react'
import { Trophy, Compass, Star, Activity, Sparkles, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'

interface Winner {
  id: string
  index: number
  username: string
  merkleProof: unknown
}

interface WinnersListProps {
  drawn: boolean
  winners: Winner[]
  prizeDescription?: string | null
  commitTimestamp?: number
  createdAt?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 22
    }
  }
} as const

export function WinnersList({ drawn, winners, prizeDescription, commitTimestamp, createdAt }: WinnersListProps) {
  const [now, setNow] = useState(Date.now())

  // Periodically refresh the time while awaiting the commit target
  useEffect(() => {
    if (!drawn && commitTimestamp) {
      const interval = setInterval(() => {
        setNow(Date.now())
      }, 200)
      return () => clearInterval(interval)
    }
  }, [drawn, commitTimestamp])

  const timeRemainingMs = commitTimestamp ? commitTimestamp - now : 0
  // Dynamically compute the total buffer duration from creation time to commit target
  const totalDurationMs = (commitTimestamp && createdAt)
    ? Math.max(1, commitTimestamp - new Date(createdAt).getTime())
    : 8000 // fallback to 8 seconds (the current buffer delay)
  const msPassed = Math.max(0, totalDurationMs - timeRemainingMs)
  const percent = Math.min(100, Math.max(0, (msPassed / totalDurationMs) * 100))
  const secondsRemaining = Math.max(0, Math.ceil(timeRemainingMs / 1000))

  if (!drawn) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 flex flex-col justify-center overflow-hidden h-[330px] space-y-5 text-left relative"
      >
        <div className="absolute -inset-10 bg-gradient-to-tr from-solar-amber/5 via-transparent to-hyper-indigo/5 opacity-55 blur-xl pointer-events-none animate-pulse" />
        
        {/* Dynamic Telemetry Radar Tracker */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/5 z-10 font-mono">
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center relative shrink-0">
            <Compass className="h-5 w-5 text-solar-amber animate-spin" style={{ animationDuration: '16s' }} />
            <span className="absolute inset-0 rounded-xl border border-solar-amber/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h4 className="text-slate-200 font-bold text-sm uppercase tracking-widest leading-none">AWAITING_COSMIC_ENTROPY</h4>
            <span className="text-xs text-slate-550 block mt-1">Ground radar active, scanning orbits...</span>
          </div>
        </div>

        {commitTimestamp && timeRemainingMs > 0 ? (
          <div className="space-y-4.5 z-10 text-left pt-1 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-550 font-bold uppercase tracking-wider text-xs">Target commitment lock buffer:</span>
              <span className="text-solar-amber font-bold text-xs bg-amber-950/40 border border-solar-amber/25 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                <Activity className="h-3 w-3" />
                TELEMETRY_BUFF_ACTIVE
              </span>
            </div>

            {/* Visual gradient progress bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-black/60 rounded-full border border-white/5 overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-hyper-indigo via-solar-amber to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all duration-300 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 uppercase tracking-widest font-bold">
                <span>Raffle Init</span>
                <span>Buffer Target Sweep</span>
                <span>Lock Passed</span>
              </div>
            </div>

            {/* Diagnostic stats */}
            <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 text-sm leading-relaxed text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Time Remaining:</span>
                <span className="text-solar-amber font-extrabold">{secondsRemaining}s buffer delay</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                <span>Satellite Lock Timestamp:</span>
                <span className="text-slate-300">{new Date(commitTimestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 z-10 font-mono">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 relative">
              <Star className="h-6 w-6 animate-pulse" />
              <span className="absolute inset-0 rounded-xl border border-emerald-400/30 animate-ping" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-slate-200 font-bold text-sm uppercase tracking-widest">Commitment Unlocked!</p>
              <p className="text-slate-550 text-sm leading-relaxed mt-1 font-medium">
                The satellite target buffer time has elapsed. The LEO Cosmic Random seed can now be requested by any peer off-chain.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // Helper to get gold, silver, bronze winner tier styling
  const getWinnerTierStyle = (idx: number) => {
    switch (idx) {
      case 0: // Gold #1
        return {
          container: 'border-solar-amber/35 bg-gradient-to-r from-solar-amber/15 via-yellow-950/5 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.06)]',
          badge: 'from-solar-amber to-yellow-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
          name: 'text-solar-amber glow-text-amber font-black',
        }
      case 1: // Silver #2
        return {
          container: 'border-slate-300/30 bg-gradient-to-r from-slate-300/10 via-slate-950/5 to-transparent',
          badge: 'from-slate-300 to-slate-400 text-slate-950 shadow-[0_0_6px_rgba(203,213,225,0.3)]',
          name: 'text-slate-250 font-bold',
        }
      case 2: // Bronze #3
        return {
          container: 'border-orange-500/25 bg-gradient-to-r from-orange-500/5 via-slate-950/5 to-transparent',
          badge: 'from-orange-400 to-orange-500 text-slate-950 shadow-[0_0_6px_rgba(249,115,22,0.2)]',
          name: 'text-orange-350 font-bold',
        }
      default:
        return {
          container: 'border-white/5 bg-slate-950/20',
          badge: 'from-slate-700 to-slate-800 text-slate-300',
          name: 'text-slate-300 font-semibold',
        }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5 space-y-5 shadow-xl relative overflow-hidden select-text text-left"
    >
      {/* Floating stellar particles inside drawn winners card */}
      <style>{`
        @keyframes float-particle {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-40px) translateX(20px) rotate(180deg); opacity: 0.5; }
          100% { transform: translateY(-80px) translateX(0px) rotate(360deg); opacity: 0; }
        }
        .star-particle {
          position: absolute;
          background: radial-gradient(circle, #ffb300, transparent);
          border-radius: 50%;
          pointer-events: none;
          animation: float-particle 10s linear infinite;
        }
      `}</style>
      <div className="star-particle h-1.5 w-1.5" style={{ top: '80%', left: '10%', animationDelay: '0s' }} />
      <div className="star-particle h-2 w-2" style={{ top: '60%', left: '85%', animationDelay: '3s', background: 'radial-gradient(circle, #ffc400, transparent)' }} />
      <div className="star-particle h-1 w-1" style={{ top: '90%', left: '40%', animationDelay: '6s' }} />

      <div className="flex items-center justify-between pb-3 border-b border-white/5 font-mono">
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
          <Trophy className="h-4.5 w-4.5 text-solar-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-bounce" />
          Official Winner Board
        </h4>
        <span className="text-xs text-solar-amber font-bold bg-solar-amber/10 border border-solar-amber/25 px-2.5 py-1 rounded-xl tracking-widest uppercase shadow-[0_0_10px_rgba(245,158,11,0.06)]">
          {winners.length} Winner slots
        </span>
      </div>

      {prizeDescription && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-solar-amber bg-solar-amber/5 border border-solar-amber/15 p-3.5 rounded-xl flex items-start gap-3 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)]"
        >
          <Trophy className="h-4.5 w-4.5 shrink-0 text-solar-amber mt-0.5 animate-pulse" />
          <div className="font-mono">
            <span className="text-slate-550 block text-xs uppercase font-bold tracking-wider">Prize Telemetry:</span>
            <strong className="tracking-widest text-solar-amber text-base font-sans uppercase font-black">{prizeDescription}</strong>
          </div>
        </motion.div>
      )}

      {/* Winners list with stagger animation */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2.5 max-h-80 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin"
      >
        {winners.map((winner, idx) => {
          const tier = getWinnerTierStyle(idx)
          
          return (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.025, x: 2 }}
              key={winner.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border font-mono transition-all duration-300 overflow-hidden ${tier.container}`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={`h-6 w-6 rounded-lg bg-gradient-to-br font-bold flex items-center justify-center text-xs shrink-0 ${tier.badge}`}>
                  #{idx + 1}
                </span>
                <div className="truncate text-left">
                  <span className={`text-sm block tracking-wide truncate ${tier.name}`}>{winner.username}</span>
                  <span className="text-xs text-slate-400 font-semibold block mt-0.5">Ticket Index: #{winner.index}</span>
                </div>
              </div>
              
              <div className="text-right shrink-0 flex flex-col items-end justify-center">
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/25 px-2.5 py-1 rounded-xl tracking-widest uppercase shadow-[0_0_8px_rgba(52,211,153,0.06)] animate-pulse flex items-center gap-1 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Verified
                </span>
                <span className="text-[8px] text-slate-500 font-mono font-bold block mt-1 tracking-widest uppercase">
                  [TEE_OBS_PASS]
                </span>
              </div>
            </motion.div>
          )
        })}

        {winners.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-10 font-medium font-mono uppercase tracking-widest">
            [NO_WINNERS_RECORDED]
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
