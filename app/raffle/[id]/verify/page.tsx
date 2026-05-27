'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { MainHeader } from '@/components/shell/MainHeader'
import { parseEntries } from '@/lib/cosmic-raffle/parseEntries'
import { MerkleTree } from '@/lib/cosmic-raffle/merkle'
import { seedToBytes32 } from '@/lib/cosmic-raffle/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Terminal, ShieldCheck, ArrowLeft, Play, Trophy, Loader2, Radio, Server, Activity, Key } from 'lucide-react'
import { keccak256, encodePacked } from 'viem'
import { motion, AnimatePresence } from 'motion/react'

interface Raffle {
  id: string
  title: string
  merkleRoot: string
  winnerCount: number
  totalEntries: number
  seed?: string | null
  rawEntries: string
}

export default function OfflineVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Verification Form Inputs
  const [rawInput, setRawInput] = useState('')
  const [seedInput, setSeedInput] = useState('')
  const [winnerCountInput, setWinnerCountInput] = useState('1')

  // Verification Outputs
  const [verificationRan, setVerificationRan] = useState(false)
  const [computedRoot, setComputedRoot] = useState('')
  const [isRootValid, setIsRootValid] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [verifiedWinners, setVerifiedWinners] = useState<{ username: string; index: number }[]>([])

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        const res = await fetch(`/api/raffles/${id}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load raffle details.')
        }
        const r = json.raffle as Raffle
        setRaffle(r)
        setRawInput(r.rawEntries)
        setSeedInput(r.seed || '')
        setWinnerCountInput(String(r.winnerCount))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred.')
      } finally {
        setLoading(false)
      }
    };
    fetchRaffle()
  }, [id])

  const runVerification = async () => {
    if (!raffle) return
    setVerificationRan(false)
    setLogs([])
    setVerifiedWinners([])

    const entries = parseEntries(rawInput)
    if (entries.length === 0) {
      alert('The contestant list is empty or invalid.')
      return
    }

    const seedHex = seedToBytes32(seedInput)
    const winnerCount = Number(winnerCountInput)

    if (isNaN(winnerCount) || winnerCount <= 0 || winnerCount > entries.length) {
      alert('Invalid winner count.')
      return
    }

    const consoleLogs: string[] = []
    consoleLogs.push(`🚀 Commencing independent offline verification diagnostic...`)
    consoleLogs.push(`📦 Normalizing and sorting ${entries.length} contestant leaf entries...`)

    // 1. Rebuild Merkle Tree and Verify Root
    consoleLogs.push(`🌳 Re-evaluating cryptographic Merkle Tree (Keccak256 double-hash)...`)
    const tree = new MerkleTree(entries)
    const newRoot = tree.getRoot()
    setComputedRoot(newRoot)

    const rootMatches = newRoot.toLowerCase() === raffle.merkleRoot.toLowerCase()
    setIsRootValid(rootMatches)
    
    consoleLogs.push(`🔍 Merkle root validation:`)
    consoleLogs.push(`   - Committed Root: ${raffle.merkleRoot}`)
    consoleLogs.push(`   - Calculated Root: ${newRoot}`)
    if (rootMatches) {
      consoleLogs.push(`   ✅ [PASS] Cryptographic contestant list matches committed root.`)
    } else {
      consoleLogs.push(`   ❌ [FAIL] Sibling configuration mismatch! Contained leaves altered.`)
    }

    // 2. Perform Fisher-Yates partial shuffle client-side
    consoleLogs.push(`📡 Simulating satellite Fisher-Yates draw with seed...`)
    consoleLogs.push(`   - Cosmic seed: ${seedHex}`)

    const indices: number[] = []
    const swaps = new Map<number, number>()

    for (let i = 0; i < winnerCount; i++) {
      // Simulate EVM keccak256(abi.encodePacked(seed, i))
      const randHex = keccak256(
        encodePacked(['bytes32', 'uint256'], [seedHex, BigInt(i)])
      )
      const randNum = BigInt(randHex)
      const range = BigInt(entries.length - i)
      const offset = Number(randNum % range)
      const j = i + offset

      // Swap lookup
      const valJ = swaps.has(j) ? swaps.get(j)! : j
      const valI = swaps.has(i) ? swaps.get(i)! : i

      swaps.set(i, valJ)
      swaps.set(j, valI)

      indices.push(valJ)

      consoleLogs.push(
        `   [Swap ${i}]: offset = ${offset}, swap ${i} ↔ ${j}. Winner derived: "${entries[valJ]}" (Index #${valJ})`
      )
    }

    consoleLogs.push(`🏆 Completed! Independent offline audit finished.`)

    setLogs(consoleLogs)
    setVerifiedWinners(indices.map((idx) => ({ username: entries[idx], index: idx })))
    setVerificationRan(true)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-space-950 text-white font-mono">
        <MainHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">initiating local processor...</span>
        </div>
      </div>
    )
  }

  if (error || !raffle) {
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-space-950 text-white font-mono">
        <MainHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-center text-xs text-rose-400">
            [CRITICAL_CONSOLE_ERROR]: {error || 'Failed to load raffle info.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden text-white select-none">
      <MainHeader />

      <div className="flex-1 overflow-y-auto py-10 px-6 scrollbar-thin select-text">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Navigation header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 animate-fadeIn font-mono">
            <Link
              href={`/raffle/${raffle.id}`}
              className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to single-campaign
            </Link>
            <span className="text-[9px] text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/20 px-3 py-1 rounded uppercase tracking-widest">
              OFFLINE_WORKSTATION.EXE
            </span>
          </div>

          <div className="space-y-1.5 animate-fadeIn text-left" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-100 font-sans">
              Independent Offline Audit Terminal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
              Run standalone Merkle calculations and the deterministic Fisher-Yates shuffle directly in your browser. Since calculations run offline in your client sandbox, it mathematically audits the fairness of LEO satellite observations.
            </p>
          </div>

          {/* Asymmetric Split Layout Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn text-left" style={{ animationDelay: '200ms' }}>
            
            {/* Left Workspace: Input Configuration parameters */}
            <div className="glass-card p-5 space-y-5 shadow-xl">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-2 font-mono border-b border-white/5 pb-3">
                <Terminal className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                Audit Parameters Input
              </h3>

              {/* Raw contestant list */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Contestant committed leaves (CSV/Names):</label>
                <Textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  rows={6}
                  className="glass-input font-mono text-xs w-full bg-slate-950/60 border-white/5 text-slate-200 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder-slate-650"
                />
              </div>

              {/* Cosmic Seed Hex */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Cosmic Random Seed (32-bytes hex):</label>
                <Input
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="glass-input font-mono text-xs w-full bg-slate-950/60 border-white/5 text-slate-250 py-3.5 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  placeholder="0x..."
                />
              </div>

              {/* Winner Count Target */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Winner Count Target:</label>
                <Input
                  type="number"
                  min="1"
                  value={winnerCountInput}
                  onChange={(e) => setWinnerCountInput(e.target.value)}
                  className="glass-input font-mono text-xs w-full bg-slate-950/60 border-white/5 text-slate-250 py-3.5 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>

              <div className="pt-2 font-mono">
                <Button
                  onClick={runVerification}
                  disabled={!seedInput || !rawInput}
                  className="w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold uppercase tracking-widest text-[9.5px] py-4 rounded-xl shadow-lg disabled:opacity-50 transition-all hover:scale-[1.01]"
                >
                  <Play className="h-4 w-4 text-slate-950 fill-slate-950 stroke-[3px]" />
                  Execute Offline Audit
                </Button>
              </div>
            </div>

            {/* Right Workspace: Verification telemetry logs */}
            <div className="space-y-6">
              {/* Telemetry log console */}
              <div className="border border-white/10 bg-black/95 p-5 rounded-2xl font-mono text-[10.5px] leading-relaxed shadow-xl h-[440px] overflow-y-auto flex flex-col justify-between scrollbar-thin text-slate-300 relative">
                
                {/* CRT Screen raster overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.4)_100%)] bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px]" />

                <div className="space-y-3 z-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>cTRNG_STANDALONE_AUDITOR.EXE</span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      STANDALONE
                    </span>
                  </div>
                  
                  {verificationRan ? (
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin text-left leading-relaxed">
                      {logs.map((log, idx) => (
                        <div key={idx} className="break-all whitespace-pre-wrap">
                          {log}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-650 py-32 text-center uppercase tracking-widest text-[10px] font-bold">
                      [ Click &quot;Execute Offline Audit&quot; to compile verification data ]
                    </div>
                  )}
                </div>

                {verificationRan && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest z-10">
                    <span>Contestant tree: {isRootValid ? "✅ VALID" : "❌ MISMATCHED"}</span>
                    <span>Winners derived: {verifiedWinners.length}</span>
                  </div>
                )}
              </div>

              {/* Verified winner cards */}
              {verificationRan && (
                <div className="glass-card p-5 space-y-4 shadow-lg animate-fadeIn text-left">
                  <div className="flex items-center gap-1.5 text-solar-amber font-bold text-xs font-mono uppercase tracking-widest border-b border-white/5 pb-3">
                    <Trophy className="h-4.5 w-4.5 text-solar-amber animate-bounce" />
                    <span>Audit Results winner board:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-mono">
                    {verifiedWinners.map((winner, idx) => (
                      <div
                        key={winner.index}
                        className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="h-5 w-5 rounded-lg bg-solar-amber/15 text-solar-amber font-bold flex items-center justify-center text-[9px] shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-slate-200 font-bold truncate">{winner.username}</span>
                        </div>
                        <span className="text-slate-550 text-[10px]">Leaf #{winner.index}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
