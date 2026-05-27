'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, ArrowLeft, ShieldCheck, Trophy, FileText, Compass, Clock, Check, Orbit, Radio, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface Step3Props {
  infoData: {
    title: string
    description: string
    prizeDescription: string
    winnerCount: number
  }
  listData: {
    rawInput: string
    entries: string[]
    merkleRoot: string
    commitTimestamp: number
    totalEntries: number
  }
  onPrev: () => void
}

export function Step3Confirm({ infoData, listData, onPrev }: Step3Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [launchStep, setLaunchStep] = useState<number>(0)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    setLoading(true)
    
    // Commencing Grand Satellite Launching Sequence!
    setLaunchStep(1)
    setStatusText('COMMENCING SAT_LAUNCH THRUSTERS... T-MINUS 3S')
    await new Promise((r) => setTimeout(r, 800))

    setLaunchStep(2)
    setStatusText('BOOSTER IGNITION STATUS: [OK] - T-MINUS 2S')
    await new Promise((r) => setTimeout(r, 800))

    setLaunchStep(3)
    setStatusText('ORBIT ACQUISITION INJECTION... T-MINUS 1S')
    await new Promise((r) => setTimeout(r, 800))

    setLaunchStep(4)
    setStatusText('ORBITPORT ACCOMPLISHED! SYNCHRONIZING LEO TELEMETRIES...')
    await new Promise((r) => setTimeout(r, 1000))

    try {
      const res = await fetch('/api/raffles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: infoData.title,
          description: infoData.description,
          prizeDescription: infoData.prizeDescription,
          winnerCount: infoData.winnerCount,
          totalEntries: listData.totalEntries,
          merkleRoot: listData.merkleRoot,
          commitTimestamp: listData.commitTimestamp,
          rawEntries: listData.rawInput,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Error saving raffle details.')
      }

      setLaunchStep(5)
      setStatusText('LAUNCH CONFIRMED! INJECTING TELEMETRIC CONSOLE MODULE...')
      await new Promise((r) => setTimeout(r, 800))
      
      router.push(`/raffle/${json.raffle.id}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setLoading(false)
      setLaunchStep(0)
    }
  }

  const formattedLockTime = new Date(listData.commitTimestamp).toLocaleTimeString()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 select-text text-left font-sans"
    >
      <div className="border border-white/12 bg-slate-950/80 rounded-2xl p-6 space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-solar-amber/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono">
          <ShieldCheck className="h-5 w-5 text-solar-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
            Audit Parameters validation
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-mono">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/12"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <FileText className="h-3 w-3 text-solar-amber" /> Title:
            </span>
            <strong className="text-slate-100 text-sm tracking-wide block truncate">{infoData.title}</strong>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/12"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Trophy className="h-3 w-3 text-solar-amber" /> Reward:
            </span>
            <strong className="text-solar-amber text-sm block truncate">
              {infoData.prizeDescription || 'No reward telemetry set'}
            </strong>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/12"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Compass className="h-3 w-3 text-hyper-indigo" /> Contestants committed:
            </span>
            <strong className="text-slate-200 text-sm block">
              {listData.totalEntries} entries
            </strong>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/12"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-450 animate-spin" style={{ animationDuration: '4s' }} /> Winner Target count:
            </span>
            <strong className="text-emerald-400 text-sm block">
              {infoData.winnerCount} winners
            </strong>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/12 md:col-span-2"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3 text-hyper-indigo" /> Target Lock Commitment Time:
            </span>
            <strong className="text-hyper-indigo text-sm block">
              {formattedLockTime} (8 seconds security buffer included)
            </strong>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/12 md:col-span-2"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-solar-amber" /> Cryptographic Merkle Root:
            </span>
            <strong className="text-solar-amber font-mono block truncate select-all text-xs border border-solar-amber/25 p-2 rounded bg-slate-950/90 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              {listData.merkleRoot}
            </strong>
          </motion.div>
        </div>

        {infoData.description && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-white/10 text-sm text-slate-350 space-y-1"
          >
            <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider font-mono">Campaign description:</span>
            <p className="leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-white/12">{infoData.description}</p>
          </motion.div>
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 text-sm font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl"
        >
          [LAUNCH_EXCEPTION]: {error}
        </motion.div>
      )}

      {/* 1. FUTURISTIC FULL SATELLITE LAUNCH TELEMETRY SEQUENCE LOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 border border-solar-amber/20 bg-amber-950/15 rounded-2xl space-y-4 text-center shadow-lg font-mono relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />

            <div className="flex justify-center items-center gap-3.5">
              {launchStep < 4 ? (
                <Orbit className="h-7 w-7 text-solar-amber animate-spin" style={{ animationDuration: '4s' }} />
              ) : (
                <Radio className="h-7 w-7 text-emerald-400 animate-pulse" />
              )}
            </div>

            <div className="space-y-2">
              <span className="text-sm text-solar-amber font-extrabold uppercase tracking-widest block glow-text-amber animate-pulse">
                {statusText}
              </span>
              
              {/* Graphic Launch Telemetry Checklist */}
              <div className="max-w-xs mx-auto text-left text-xs text-slate-500 space-y-1 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>🚀 1. LEO INJECTION BOOSTER:</span>
                  <span className={launchStep >= 1 ? "text-emerald-400 font-bold" : "text-slate-700"}>
                    {launchStep >= 1 ? "IGNITED" : "AWAITING"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🔥 2. STAGE SEPARATION:</span>
                  <span className={launchStep >= 2 ? "text-emerald-400 font-bold" : "text-slate-700"}>
                    {launchStep >= 2 ? "COMPLETE" : "AWAITING"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>📡 3. ORBITPORT TELEMETRY STATIONS:</span>
                  <span className={launchStep >= 3 ? "text-emerald-400 font-bold" : "text-slate-700"}>
                    {launchStep >= 3 ? "LINKED" : "AWAITING"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🔒 4. cTRNG MERKLE COMPILER:</span>
                  <span className={launchStep >= 4 ? "text-emerald-400 font-bold" : "text-slate-700"}>
                    {launchStep >= 4 ? "DEPOSITED" : "AWAITING"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2 font-mono">
        <Button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-500 text-xs uppercase tracking-widest font-bold px-4 py-3 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Back step
        </Button>

        {!loading && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black uppercase tracking-widest text-xs px-6 py-4 rounded-xl shadow-lg border border-emerald-400/25 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-slate-950 fill-slate-950 animate-pulse" />
              Launch satellite campaign
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
