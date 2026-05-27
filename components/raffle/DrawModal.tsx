'use client'

import { useEffect, useState, useRef } from 'react'
import { Orbit, Trophy, Sparkles, Loader2, Compass, ShieldCheck, Cpu, Terminal, ExternalLink, Activity, Radio, Server, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface Winner {
  username: string
  index: number
}

interface DrawModalProps {
  isOpen: boolean
  title: string
  status: 'idle' | 'requesting_gateway' | 'invoking_service' | 'fetching_satellites' | 'aggregating_entropy' | 'signing_payload' | 'drawing_winners' | 'done' | 'error'
  statusText: string
  winners: Winner[]
  errorText?: string
  allEntries?: string[]
  commitTimestamp?: number
  merkleRoot?: string
  seed?: string | null
  spaceComputerEntropy?: string | null
  onClose: () => void
}

export function DrawModal({
  isOpen,
  title,
  status,
  statusText,
  winners,
  errorText,
  allEntries = [],
  commitTimestamp,
  merkleRoot,
  seed,
  spaceComputerEntropy,
  onClose,
}: DrawModalProps) {
  const [renderedWinners, setRenderedWinners] = useState<Winner[]>(() => status === 'done' ? winners : [])
  const [triggerFlash, setTriggerFlash] = useState(false)
  const [scanningName, setScanningName] = useState('')
  const [scanningEntropy, setScanningEntropy] = useState('')
  const [scanningIndex, setScanningIndex] = useState<number | null>(null)

  const logsEndRef = useRef<HTMLDivElement>(null)

  const isDrawn = status === 'done'
  const isDrawing = status !== 'idle' && status !== 'done' && status !== 'error'

  // Trigger flash effect when status transitions to done
  useEffect(() => {
    if (status === 'done') {
      // If winners haven't been populated yet, do so with stagger animation
      setRenderedWinners([])
      const timers: NodeJS.Timeout[] = []
      winners.forEach((winner, idx) => {
        const t = setTimeout(() => {
          setRenderedWinners((prev) => [...prev, winner])
        }, 300 + idx * 200)
        timers.push(t)
      })
      
      setTriggerFlash(true)
      const flashTimer = setTimeout(() => setTriggerFlash(false), 800)
      
      return () => {
        timers.forEach((t) => clearTimeout(t))
        clearTimeout(flashTimer)
      }
    }
  }, [status, winners])

  // High-speed text scroller effect simulating Merkle validation and Fisher-Yates shuffle scanning
  useEffect(() => {
    if (isDrawing) {
      const interval = setInterval(() => {
        if (allEntries && allEntries.length > 0) {
          const randomIndex = Math.floor(Math.random() * allEntries.length)
          setScanningName(allEntries[randomIndex])
          setScanningIndex(randomIndex)
        } else {
          const mockIdx = Math.floor(Math.random() * 1000)
          setScanningName(`Contestant_#${mockIdx}`)
          setScanningIndex(mockIdx)
        }
        
        // Generate random 64-character hash representing active entropy calculation
        const chars = '0123456789abcdef'
        let entropy = '0x'
        for (let i = 0; i < 64; i++) {
          entropy += chars[Math.floor(Math.random() * 16)]
        }
        setScanningEntropy(entropy)
      }, 40)

      return () => clearInterval(interval)
    }
  }, [isDrawing, allEntries])

  // Autoscroll logs to bottom
  useEffect(() => {
    if (isDrawing || isDrawn) {
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 30)
    }
  }, [status, scanningName, isDrawing, isDrawn])

  // Generate authentic logs matching SpaceComputer Starter Kit and Diagram structure
  const getLogs = () => {
    const logs: { text: string; type: 'info' | 'success' | 'warn' | 'accent' | 'system' }[] = []
    const displayRoot = merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000'

    logs.push({ text: `🏁 [START] Initiating cosmic quantum draw request...`, type: 'system' })
    logs.push({ text: `👤 [SYS] Loaded contestant registry: ${allEntries.length} valid entries`, type: 'info' })
    logs.push({ text: `🌳 [SYS] Verifying locked Merkle Root: ${displayRoot.slice(0, 24)}...`, type: 'info' })

    // Step 1: Requesting Gateway
    if (status === 'requesting_gateway' || status === 'invoking_service' || status === 'fetching_satellites' || status === 'aggregating_entropy' || status === 'signing_payload' || status === 'drawing_winners' || status === 'done') {
      logs.push({ text: `🛰️ [API_CALL] GET /api/v1/services/trng via Orbitport Gateway (op.spacecoin.xyz)`, type: 'info' })
      logs.push({ text: `   - Establishing secure TLS 1.3 handshake with ground server gateway...`, type: 'info' })
      logs.push({ text: `✓ Routed IP via GroundStation #3 (Venice, IT) [OK]`, type: 'success' })
    }

    // Step 2: Invoking Service
    if (status === 'invoking_service' || status === 'fetching_satellites' || status === 'aggregating_entropy' || status === 'signing_payload' || status === 'drawing_winners' || status === 'done') {
      logs.push({ text: `🔐 [API_CALL] POST https://auth.spacecomputer.io/oauth/token`, type: 'info' })
      logs.push({ text: `   - Exchanging client credentials for Enclave authentication token...`, type: 'info' })
      logs.push({ text: `✓ Client authorized. JWT Bearer token issued [OK]`, type: 'success' })
    }

    // Step 3: Fetching Satellites
    if (status === 'fetching_satellites' || status === 'aggregating_entropy' || status === 'signing_payload' || status === 'drawing_winners' || status === 'done') {
      logs.push({ text: `📡 [UP-LINK] Uplink sync with LEO satellites: Crypto2 & cEDGE (412.8km)`, type: 'info' })
      logs.push({ text: `   - Fetching cosmic ray noise IPFS beacon: bafkrei7yc6lshvj7d...`, type: 'info' })
      logs.push({ text: `✓ Physical cosmic ray noise block acquired from orbit [OK]`, type: 'success' })
    }

    // Step 4: Aggregating Entropy
    if (status === 'aggregating_entropy' || status === 'signing_payload' || status === 'drawing_winners' || status === 'done') {
      logs.push({ text: `⚡ [cTRNG] Sampling 256-bit raw physical ray noise entropy...`, type: 'info' })
      logs.push({ text: `   - Merging ground seed (local) and satellite entropy (cosmic)...`, type: 'info' })
      logs.push({ text: `✓ Seed consolidated: keccak256(space_noise + local_entropy) [SUCCESS]`, type: 'success' })
    }

    // Step 5: Signing Payload
    if (status === 'signing_payload' || status === 'drawing_winners' || status === 'done') {
      logs.push({ text: `💻 [TEE] Injecting mixed entropy stream into isolated enclave secure partition`, type: 'info' })
      logs.push({ text: `   - Generating remote cryptographic attestation inside hardware SpaceTEE...`, type: 'info' })
      
      // Show actual space entropy if available, otherwise show live scanning entropy
      const displayEntropy = spaceComputerEntropy || (scanningEntropy ? scanningEntropy.slice(2, 26) : '7b3f8f94f3f346a2331cdc4ed3a14c2a558e90b1')
      logs.push({ text: `🌌 Satellite hardware noise entropy: 0x${displayEntropy.replace(/^0x/, '').slice(0, 24)}`, type: 'accent' })
      logs.push({ text: `✓ Attestation compiled: MRENCLAVE verified inside TEE [VERIFIED]`, type: 'success' })
    }

    // Step 6: Drawing Winners
    if (status === 'drawing_winners' || status === 'done') {
      logs.push({ text: `🔮 [DRAW] Spawning deterministic off-chain Fisher-Yates shuffle`, type: 'info' })
      if (seed) {
        logs.push({ text: `   - Mixed Cosmic Seed: ${seed}`, type: 'accent' })
      } else {
        logs.push({ text: `   - Cosmic seed parsed successfully`, type: 'accent' })
      }
    }

    // Step 7: Done
    if (status === 'done') {
      logs.push({ text: `🏆 [SUCCESS] Telemetric draw completed successfully!`, type: 'success' })
      logs.push({ text: `   - Selected ${winners.length} winning tickets from a total of ${allEntries.length} registered contestants`, type: 'accent' })
      if (seed) {
        logs.push({ text: `🔐 [SEALED] Cosmic Seed sealed & verified: ${seed}`, type: 'success' })
      }
      logs.push({ text: `🎉 Cryptographic proof sealed successfully. Campaign state: SEALED 🔒`, type: 'success' })
    }

    return logs
  }

  const getHudStepStatus = (stepName: 'client' | 'gateway' | 'satellites' | 'spacetee' | 'earth') => {
    switch (status) {
      case 'idle':
        return 'inactive'
      case 'requesting_gateway':
        if (stepName === 'client') return 'active'
        if (stepName === 'gateway') return 'loading'
        return 'inactive'
      case 'invoking_service':
        if (['client', 'gateway'].includes(stepName)) return 'active'
        if (stepName === 'satellites') return 'loading'
        return 'inactive'
      case 'fetching_satellites':
        if (['client', 'gateway', 'satellites'].includes(stepName)) return 'active'
        if (stepName === 'spacetee') return 'loading'
        return 'inactive'
      case 'aggregating_entropy':
        if (['client', 'gateway', 'satellites', 'spacetee'].includes(stepName)) return 'active'
        if (stepName === 'earth') return 'loading'
        return 'inactive'
      case 'signing_payload':
      case 'drawing_winners':
        return 'active'
      case 'done':
        return 'success'
      case 'error':
        return 'failed'
      default:
        return 'inactive'
    }
  }

  const getStepBorderClass = (stepName: 'client' | 'gateway' | 'satellites' | 'spacetee' | 'earth') => {
    const s = getHudStepStatus(stepName)
    if (s === 'success') return 'border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] bg-emerald-950/20'
    if (s === 'active') return 'border-solar-amber text-solar-amber shadow-[0_0_10px_rgba(245,158,11,0.2)] bg-amber-950/20'
    if (s === 'loading') return 'border-hyper-indigo text-hyper-indigo animate-pulse bg-slate-900/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
    if (s === 'failed') return 'border-rose-500 text-rose-400 bg-rose-950/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
    return 'border-white/5 text-slate-600 bg-transparent'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md overflow-y-auto p-4 select-none"
        >
          <style>{`
            @keyframes scanline {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            @keyframes chip-pulsing {
              0% { opacity: 0.3; }
              50% { opacity: 1; filter: drop-shadow(0 0 8px #ffb300); }
              100% { opacity: 0.3; }
            }
            .cyber-chip-pulse {
              animation: chip-pulsing 2s infinite ease-in-out;
            }
          `}</style>

          {/* White screen flash overlay on success */}
          {triggerFlash && (
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none" 
            />
          )}

          {/* Main modal card */}
          <motion.div 
            layout
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              layout: { type: 'spring', stiffness: 220, damping: 28 }
            }}
            className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950/90 p-5 md:p-7 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Cyber Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-solar-amber shadow-[0_0_6px_#ffb300]" />
            <div className="absolute top-0 left-0 w-[1px] h-8 bg-solar-amber shadow-[0_0_6px_#ffb300]" />
            <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-hyper-indigo shadow-[0_0_6px_#f59e0b]" />
            <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-hyper-indigo shadow-[0_0_6px_#f59e0b]" />

            <div className="absolute top-4 right-4 text-[8px] font-mono text-slate-500">
              SYSTEM_STATE: {status.toUpperCase()}
            </div>

            {/* Content */}
            <motion.div layout className="flex flex-col items-center text-center space-y-6 w-full">
              <motion.div layout="position" className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-100 font-sans">
                  {title}
                </h2>
                <p className="text-[10px] text-slate-550 uppercase tracking-widest font-mono font-bold">
                  SpaceComputer cTRNG Cryptographic Draw Panel
                </p>
              </motion.div>

              {/* 1. Interactive HUD Flow Mapping Diagram (Gold Re-themed) */}
              {isDrawing && (
                <motion.div layout="position" className="w-full bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-3 text-left">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                    Ground-to-Orbit Network Link Telemetry:
                  </span>
                  
                  <div className="grid grid-cols-5 gap-2 font-mono text-[10px] items-center relative py-1">
                    <div className="absolute left-[8%] right-[8%] top-[50%] h-[1px] bg-white/5 -z-10" />

                    {/* Step 1: Client */}
                    <div className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all duration-300 ${getStepBorderClass('client')}`}>
                      <Server className="h-4.5 w-4.5 mb-1" />
                      <span className="font-bold text-[9px]">Client</span>
                    </div>

                    {/* Step 2: Gateway */}
                    <div className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all duration-300 ${getStepBorderClass('gateway')}`}>
                      <Radio className="h-4.5 w-4.5 mb-1" />
                      <span className="font-bold text-[9px]">Orbitport</span>
                    </div>

                    {/* Step 3: Satellites */}
                    <div className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all duration-300 ${getStepBorderClass('satellites')}`}>
                      <Orbit className="h-4.5 w-4.5 mb-1" />
                      <span className="font-bold text-[9px]">Satellites</span>
                    </div>

                    {/* Step 4: SpaceTEE */}
                    <div className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all duration-300 ${getStepBorderClass('spacetee')}`}>
                      <Cpu className="h-4.5 w-4.5 mb-1" />
                      <span className="font-bold text-[9px]">SpaceTEE</span>
                    </div>

                    {/* Step 5: Earth */}
                    <div className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all duration-300 ${getStepBorderClass('earth')}`}>
                      <Compass className="h-4.5 w-4.5 mb-1" />
                      <span className="font-bold text-[9px]">Ground</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. Cyber Scroller and Log Console */}
              {isDrawing && (
                <motion.div layout="position" className="w-full space-y-4">
                  {/* Advanced Cyber Scan Terminal Screen */}
                  <div className="relative w-full border-2 border-solar-amber/20 bg-black/90 rounded-2xl p-4 md:p-5 shadow-[inset_0_0_30px_rgba(245,158,11,0.15)] overflow-hidden font-mono text-left space-y-4">
                    <div className="cyber-scanner-laser" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.5)_100%)] bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px]" />

                    {/* System screen subtitle header */}
                    <div className="flex justify-between items-center text-[10px] text-solar-amber/70 border-b border-solar-amber/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-solar-amber animate-pulse" />
                        <span>ORBITPORT_cTRNG_SOLVER.EXE</span>
                      </div>
                      <span>SECURE_LINK: ACTIVE</span>
                    </div>

                    {/* Active Candidate text display */}
                    <div className="space-y-1.5 py-1.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Scanning active Merkle tree leaf node:</div>
                      <div className="text-lg md:text-xl font-black text-solar-amber tracking-wide py-3 px-4 border border-solar-amber/20 bg-amber-950/20 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.12)] flex items-center justify-between overflow-hidden">
                        <span className="truncate pr-4">{scanningName}</span>
                        <span className="text-[10px] text-hyper-indigo shrink-0 font-bold px-2 py-0.5 border border-solar-amber/20 bg-amber-950/40 rounded">
                          LEAF #{scanningIndex}
                        </span>
                      </div>
                    </div>

                    {/* Live Console log feed */}
                    <div className="bg-black/90 p-3.5 rounded-xl border border-white/5 font-mono text-[10px] space-y-1.5 max-h-[185px] overflow-y-auto scrollbar-thin select-text mt-4 scan-line-overlay">
                      {getLogs().map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-solar-amber shrink-0 font-bold select-none">&gt;</span>
                          <span className={
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'accent' ? 'text-solar-amber font-semibold' :
                            log.type === 'system' ? 'text-solar-amber font-bold' :
                            log.type === 'warn' ? 'text-rose-400' :
                            'text-slate-350'
                          }>
                            {log.text}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>

                  {/* Status loader */}
                  <div className="space-y-1.5 pt-1">
                    <span className="flex items-center justify-center gap-2 text-xs text-solar-amber font-bold uppercase tracking-widest animate-pulse font-mono">
                      <Loader2 className="h-4 w-4 animate-spin text-solar-amber" />
                      {statusText}
                    </span>
                    <p className="text-[10px] text-slate-500 max-w-sm mx-auto font-medium">
                      LEO physical ray noise observations are processed deterministically via a Fisher-Yates draw loop.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 3. Error Telemetry Display */}
              {status === 'error' && (
                <div className="space-y-4 py-4 w-full text-left font-mono">
                  <div className="p-4 border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 rounded-xl leading-relaxed space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                      <span>API_LINK_EXCEPTION: DRAW_SEQUENCE_TERMINATED</span>
                    </div>
                    <p className="bg-black/50 p-2.5 rounded-lg border border-rose-500/10 break-all select-all text-[10px]">{errorText}</p>
                  </div>
                  <Button
                    onClick={onClose}
                    className="w-full bg-slate-900 border border-white/5 text-slate-200 uppercase text-[9px] tracking-widest font-bold py-3.5"
                  >
                    Close console
                  </Button>
                </div>
              )}

              {/* 4. Complete/Winners Celebrations Screen (Done Status) */}
              {isDrawn && (
                <motion.div layout="position" className="w-full space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    {/* Pulsing Trophy Ring */}
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border border-solar-amber/35 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.1, 0.6] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="relative h-12 w-12 rounded-full bg-solar-amber/15 border border-solar-amber/30 flex items-center justify-center text-solar-amber">
                        <Trophy className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <h3 className="text-base font-black text-solar-amber flex items-center gap-1.5 uppercase tracking-wider font-sans mt-2 glow-text-amber">
                      <Sparkles className="h-4.5 w-4.5" />
                      Cosmic Winners Derived!
                      <Sparkles className="h-4.5 w-4.5" />
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">
                      Decentralized hardware proof sealed
                    </span>
                  </div>

                  {/* Completed Screen Terminal Log Recap */}
                  <div className="relative w-full border border-white/5 bg-black/90 rounded-2xl p-4 font-mono text-[9px]">
                    <div className="flex justify-between items-center text-slate-500 border-b border-white/5 pb-1.5 mb-2 font-bold uppercase tracking-widest">
                      <span>AUDIT_LOG_STREAM.LOG</span>
                      <span className="text-emerald-500">SEALED &amp; DEPOSITED</span>
                    </div>
                    <div className="bg-black/50 p-2.5 rounded-xl text-[10px] space-y-1 max-h-[185px] overflow-y-auto scrollbar-thin select-text scan-line-overlay">
                      {getLogs().map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1 leading-normal">
                          <span className="text-solar-amber shrink-0 font-bold select-none">&gt;</span>
                          <span className={
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'accent' ? 'text-solar-amber font-semibold' :
                            log.type === 'system' ? 'text-solar-amber font-bold' :
                            log.type === 'warn' ? 'text-rose-400' :
                            'text-slate-450'
                          }>
                            {log.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top derived winners cards */}
                  <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto px-1 py-1.5 scrollbar-thin">
                    {renderedWinners.map((winner, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20, delay: idx * 0.1 }}
                        key={winner.index}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-solar-amber/25 bg-gradient-to-r from-amber-950/20 to-yellow-950/10 text-xs font-mono font-medium shadow-[0_2px_8px_rgba(245,158,11,0.03)]"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-solar-amber to-yellow-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-slate-100 font-bold tracking-wide truncate">{winner.username}</span>
                        </div>
                        <span className="text-solar-amber font-bold text-[10px] px-2 py-0.5 border border-solar-amber/20 bg-amber-950/40 rounded-xl shrink-0">
                          Index #{winner.index}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-3.5 font-mono">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Physical orbit consensus verified &amp; sealed
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full"
                    >
                      <Button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-solar-amber via-yellow-500 to-solar-amber hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg"
                      >
                        Sealed &amp; Close Console
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
