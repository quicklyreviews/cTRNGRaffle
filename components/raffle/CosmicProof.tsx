'use client'

import { useState } from 'react'
import { Shield, Sparkles, Orbit, Compass, FileText, Cpu, Loader2, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react'
import { motion } from 'motion/react'

interface CosmicProofProps {
  merkleRoot: string
  commitTimestamp: number
  seed?: string | null
  drawn: boolean
  cosmicProof?: {
    raffleId: string
    commitTimestamp: number
    spaceComputerEntropy: string | null
    verificationMode: 'authenticated_sdk' | 'public_sdk_ipfs' | 'fallback_ipfs' | 'rpc_fallback'
    sourceUrl?: string
    timestamp?: number
    sequence?: number | null
    src?: string | null
    service?: string | null
    signature?: {
      algo: string
      value: string
      pk: string
    } | null
  } | null
}

export function CosmicProof({ merkleRoot, commitTimestamp, seed, drawn, cosmicProof }: CosmicProofProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getVerificationModeBadge = () => {
    if (!cosmicProof) return null
    switch (cosmicProof.verificationMode) {
      case 'authenticated_sdk':
        return (
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-wider font-mono">
            <Orbit className="h-3 w-3 animate-spin text-emerald-400" />
            Direct SDK
          </span>
        )
      case 'public_sdk_ipfs':
      case 'fallback_ipfs':
        return (
          <span className="text-xs text-solar-amber font-bold bg-amber-950/40 border border-solar-amber/20 px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-wider font-mono">
            <Orbit className="h-3 w-3 text-solar-amber animate-pulse" />
            IPFS Chain
          </span>
        )
      case 'rpc_fallback':
        return (
          <span className="text-xs text-solar-amber font-bold bg-solar-amber/10 border border-solar-amber/20 px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-wider font-mono">
            Fallback
          </span>
        )
      default:
        return null
    }
  }

  const formattedCommitTime = new Date(commitTimestamp).toLocaleString()

  return (
    <div className="glass-card p-5 space-y-6 shadow-xl relative overflow-hidden select-text text-left">
      <style>{`
        @keyframes radar-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .radar-sweep-ring {
          position: absolute;
          border: 1px solid rgba(245, 158, 11, 0.15);
          border-radius: 50%;
          animation: radar-pulse 3s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
      `}</style>

      <div className="pb-3 border-b border-white/5 flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-100 font-mono flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-solar-amber animate-pulse" />
          Audit &amp; Cryptography
        </h4>
        <span className="text-xs text-solar-amber font-bold bg-amber-950/30 border border-solar-amber/20 px-2.5 py-1 rounded-xl tracking-wider uppercase font-mono">
          Audit telemetry
        </span>
      </div>

      {/* Explanatory segment */}
      <div className="p-4 border border-solar-amber/10 bg-amber-950/10 rounded-xl space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-solar-amber uppercase tracking-wider font-mono">
            <Sparkles className="h-3.5 w-3.5 text-solar-amber animate-pulse" />
            Provably Fair Protocol
          </div>
          {getVerificationModeBadge()}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Outcome calculations combine Offline Merkle Trees to freeze contestants and LEO Satellite Cosmic Ray Beacons (SpaceComputer cTRNG) as true physical entropy. Neither administrators, developers, nor users can bias or manipulate the drawn seed once locked.
        </p>
      </div>

      {/* Staggered steps flow */}
      <div className="space-y-6 text-sm font-sans">
        
        {/* Step 1: Merkle Tree */}
        <div className="relative pl-8 before:absolute before:left-2.5 before:top-6 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-solar-amber/40 before:to-hyper-indigo/20">
          <div className="absolute left-0 top-0.5 h-6 w-6 rounded-lg bg-slate-900 border border-solar-amber/20 flex items-center justify-center text-solar-amber shadow-[0_0_12px_rgba(245,158,11,0.15)] z-10">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
              1. Merkle Tree Lock
            </h5>
            <p className="text-slate-400 text-xs leading-relaxed">
              Contestants are normalized in lexicographical order to construct a secure cryptographic tree. The root hash is locked upon raffle initialization.
            </p>
            
            {/* Merkle Root hash display */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 font-mono text-[10px] break-all select-all text-solar-amber/90 max-w-full flex items-center justify-between gap-2">
              <span className="truncate flex-1 font-bold">{merkleRoot}</span>
              <button 
                onClick={() => handleCopy(merkleRoot, 'merkleRoot')}
                className="p-1 text-slate-500 hover:text-solar-amber transition-colors shrink-0"
              >
                {copiedKey === 'merkleRoot' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Telemetry targeting commitment buffer */}
        <div className="relative pl-8 before:absolute before:left-2.5 before:top-6 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-hyper-indigo/40 before:to-solar-amber/20">
          <div className={`absolute left-0 top-0.5 h-6 w-6 rounded-lg bg-slate-900 border flex items-center justify-center z-10 relative overflow-hidden ${drawn ? 'border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-hyper-indigo/20 text-hyper-indigo shadow-[0_0_12px_rgba(245,158,11,0.15)]'}`}>
            {!drawn && (
              <>
                <div className="radar-sweep-ring h-full w-full" style={{ animationDelay: '0s' }} />
                <div className="radar-sweep-ring h-full w-full" style={{ animationDelay: '1.5s' }} />
              </>
            )}
            <Compass className="h-3.5 w-3.5 z-10" />
          </div>
          
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
              {drawn ? '2. Commitment Target Met' : '2. Future Commitment Target'}
            </h5>
            <p className="text-slate-400 text-xs leading-relaxed">
              {drawn
                ? 'The buffer lock has elapsed successfully. Satellite cosmic entropy observations were captured and sealed into the cryptographic proof chain.'
                : 'The drawing cannot request satellite entropy until the specific buffer lock passes. This prevents front-running draws.'}
            </p>
            {drawn ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/25 rounded-xl text-emerald-400 font-bold text-xs uppercase font-mono">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                </span>
                Target Reached: {formattedCommitTime}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 border border-solar-amber/25 rounded-xl text-solar-amber font-bold text-xs uppercase font-mono">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-solar-amber opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-solar-amber"></span>
                </span>
                Target Time: {formattedCommitTime}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: SpaceComputer cTRNG & Fisher-Yates shuffle */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-0.5 h-6 w-6 rounded-lg bg-slate-900 border border-solar-amber/25 flex items-center justify-center text-solar-amber shadow-[0_0_12px_rgba(245,158,11,0.15)] z-10">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
              3. Cosmic Ray Random Seed
            </h5>
            <p className="text-slate-400 text-xs leading-relaxed">
              LEO satellite cosmic radiation noise derives an ungameable Cosmic Seed. A deterministic Fisher-Yates loop picks the tickets.
            </p>
            
            {drawn && seed ? (
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-solar-amber/15 font-mono text-[10px] text-slate-350 flex items-center justify-between gap-2">
                  <div className="truncate flex-1">
                    <span className="text-slate-500 block uppercase text-[10px] font-bold tracking-wider mb-0.5">Seed value (Keccak256):</span>
                    <span className="text-solar-amber font-black block truncate select-all">{seed}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(seed, 'seed')}
                    className="p-1 text-slate-500 hover:text-solar-amber transition-colors shrink-0"
                  >
                    {copiedKey === 'seed' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                {/* IPFS mirror links */}
                <div className="border-t border-white/5 pt-2 mt-1 space-y-1.5 font-mono text-xs">
                  <span className="text-slate-500 font-bold block uppercase tracking-wider">Independent IPFS Mirrors:</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 leading-normal">
                    <a
                      href="https://ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-solar-amber hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      ipfs.io <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <span className="text-slate-700">|</span>
                    <a
                      href="https://dweb.link/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-solar-amber hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      dweb.link <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <span className="text-slate-700">|</span>
                    <a
                      href="https://gateway.ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-solar-amber hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      gateway.ipfs <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-dashed border-white/5 flex items-center gap-2 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
                <span>Awaiting target commitment to resolve entropy...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
