'use client'

import { useState } from 'react'
import { Search, ShieldCheck, ShieldAlert, Trophy, Award, Loader2, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'motion/react'

interface VerifyPanelProps {
  raffleId: string
  drawn: boolean
}

interface VerificationResult {
  exists: boolean
  username?: string
  index?: number
  proof?: string[]
  isValid?: boolean
  isWinner?: boolean
  winningIndex?: number
  merkleRoot?: string
  message?: string
}

export function VerifyPanel({ raffleId, drawn }: VerifyPanelProps) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!username.trim()) {
      setError('Please enter a username or wallet address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/raffles/${raffleId}/verify-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Verification error.')
      }

      setResult(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-5 space-y-5 shadow-xl relative overflow-hidden select-text text-left">
      <div className="pb-3 border-b border-white/5 font-mono">
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-solar-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          Ticket Verifier
        </h4>
        <p className="text-slate-500 text-xs leading-relaxed mt-1 font-medium">
          Verify index placement inside the Merkle Tree and prize selection.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* Sleek Floating Input Wrapper */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or wallet address..."
              className="glass-input w-full bg-slate-950/60 border-white/5 text-slate-200 text-sm py-3.5 pl-3.5 focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 transition-all font-mono"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !username.trim()}
            className="bg-solar-amber hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-widest text-xs px-4.5 py-3.5 shrink-0 flex items-center gap-1.5 rounded-xl border border-solar-amber/20 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 text-slate-950 stroke-[3px]" />
            )}
            Search
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-3 text-sm font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          [VERIFY_ERROR]: {error}
        </div>
      )}

      {/* Result Cards */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Case 1: Doesn't exist */}
            {!result.exists && (
              <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl flex items-start gap-2.5 text-sm text-rose-350 font-mono">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-slate-200 uppercase tracking-wide">TICKET_NOT_FOUND</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{result.message}</p>
                </div>
              </div>
            )}

            {/* Case 2: Exists */}
            {result.exists && (
              <div className="space-y-4">
                {/* Winner Status Banner */}
                {drawn ? (
                  result.isWinner ? (
                    <div className="p-4 border border-solar-amber/20 bg-solar-amber/5 rounded-xl flex items-start gap-3 text-sm text-solar-amber shadow-[0_0_20px_rgba(245,158,11,0.08)]">
                      <Trophy className="h-5 w-5 shrink-0 text-solar-amber animate-bounce" />
                      <div>
                        <strong className="text-solar-amber text-sm block font-sans uppercase font-black tracking-wider">Congratulations! You Won!</strong>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-mono">
                          Your ticket matches Leaf Index <span className="text-slate-200 font-extrabold">#{result.index}</span>. Decoded and selected successfully by the Space random generator seed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-white/5 bg-slate-900/30 rounded-xl flex items-start gap-3 text-sm text-slate-400">
                      <Award className="h-5 w-5 shrink-0 text-slate-500" />
                      <div>
                        <strong className="text-slate-200 block font-sans uppercase font-bold tracking-wider">Ticket Validated</strong>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-mono">
                          Your ticket matches Leaf Index <span className="text-slate-300">#{result.index}</span>. Validated on-tree but not selected during this draw sequence.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-4 border border-solar-amber/25 bg-amber-950/20 rounded-xl flex items-start gap-3 text-sm text-solar-amber shadow-[0_0_20px_rgba(245,158,11,0.06)]">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-solar-amber" />
                    <div>
                      <strong className="text-amber-200 block font-sans uppercase font-bold tracking-wider">Ticket Committed &amp; Verified</strong>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-mono">
                        Committed inside Merkle Tree at index <span className="text-slate-200 font-bold">#{result.index}</span>. Fully secure for draw.
                      </p>
                    </div>
                  </div>
                )}

                {/* Merkle Proof Details */}
                <div className="bg-slate-950/90 border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] font-mono text-xs">
                  <span className="text-slate-550 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Key className="h-3 w-3 text-slate-550" />
                    Cryptographic Merkle Path Analysis:
                  </span>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 text-slate-500 border-b border-white/5 pb-1.5 mb-1.5 text-[10px] uppercase font-bold tracking-widest">
                      <span>Sibling Path Node</span>
                      <span>Hash telemetries (32-bytes)</span>
                    </div>
                    {result.proof && result.proof.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 text-slate-450 hover:bg-white/5 px-2 rounded-xl transition-colors">
                        <span className="text-slate-500 font-bold text-[10px]">PATH_NODE [{idx}]</span>
                        <span className="text-solar-amber truncate w-48 block text-right font-bold text-xs" title={p}>{p}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 text-slate-450 border-t border-white/5 mt-2.5 pt-2 font-mono">
                      <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Resolved Root Hash</span>
                      <span className="text-emerald-400 truncate w-48 block text-right font-black text-xs" title={result.merkleRoot}>{result.merkleRoot}</span>
                    </div>
                  </div>
                  
                  {/* Cryptographic integrity validation seal */}
                  <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1.5 pt-2 border-t border-white/5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>Calculated Root Integrity Check:</span>
                    <strong className={result.isValid ? "text-emerald-400 glow-text-emerald font-black" : "text-rose-400 font-black"}>
                      {result.isValid ? "PASS" : "FAIL"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
