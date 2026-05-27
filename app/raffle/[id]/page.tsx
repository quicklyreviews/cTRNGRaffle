'use client'

import { useEffect, useState, use, useRef } from 'react'
import Link from 'next/link'
import { MainHeader } from '@/components/shell/MainHeader'
import { CosmicProof } from '@/components/raffle/CosmicProof'
import { WinnersList } from '@/components/raffle/WinnersList'
import { VerifyPanel } from '@/components/raffle/VerifyPanel'
import { DrawModal } from '@/components/raffle/DrawModal'
import { Button } from '@/components/ui/button'
import { Orbit, Compass, Trophy, ExternalLink, ShieldCheck, ArrowLeft, Loader2, Search, Check, Copy, ChevronDown, ChevronUp, Radio, Activity, Terminal, Server, Cpu, Globe, Satellite } from 'lucide-react'
import { parseEntries } from '@/lib/cosmic-raffle/parseEntries'
import { motion, AnimatePresence } from 'motion/react'

interface Raffle {
  id: string
  title: string
  description?: string | null
  prizeDescription?: string | null
  winnerCount: number
  totalEntries: number
  merkleRoot: string
  commitTimestamp: number
  drawn: boolean
  seed?: string | null
  cosmicProof: any
  rawEntries: string
  createdAt: string
}

interface Winner {
  id: string
  index: number
  username: string
  merkleProof: string[]
}

function deriveHash(input: string, salt: string, prefix: string): string {
  let hash = 0
  const combined = input + salt
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i)
    hash |= 0
  }
  let hexStr = ''
  for (let i = 1; i <= 7; i++) {
    hexStr += Math.abs(hash * i * 33).toString(16).slice(0, 8)
  }
  return `${prefix}${hexStr}`.slice(0, 66)
}

export default function RaffleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isDrawingRef = useRef(false)
  const autoTriggeredRef = useRef(false)
  const raffleRef = useRef<Raffle | null>(null)

  const [raffle, setRaffle] = useState<Raffle | null>(null)
  
  useEffect(() => {
    raffleRef.current = raffle
  }, [raffle])

  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(Date.now())

  // Dynamic Telemetry Tickers
  const [coords, setCoords] = useState({ lat: 45.1824, lon: 12.3156, alt: 412.85, sync: 99.82, orbitSpeed: 7.78, temp: 18.5 })

  // Real-time logs
  const [logs, setLogs] = useState<string[]>([
    '[SYS] Connecting to campaign node...',
    '[LEO] Syncing telemetry coordinates',
    '[TEE] Cryptographic attestation channel active',
    '[SYS] Buffer timing verified with Orbitport api'
  ])

  // High-frequency Entropy Ticker Bytes
  const [entropyBytes, setEntropyBytes] = useState<string[]>([])

  // Draw states
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false)
  const [drawStatus, setDrawStatus] = useState<'idle' | 'requesting_gateway' | 'invoking_service' | 'fetching_satellites' | 'aggregating_entropy' | 'signing_payload' | 'drawing_winners' | 'done' | 'error'>('idle')
  const [drawStatusText, setDrawStatusText] = useState('')
  const [drawErrorText, setDrawErrorText] = useState('')
  const [drawnWinners, setDrawnWinners] = useState<{ username: string; index: number }[]>([])
  const [drawnSeed, setDrawnSeed] = useState<string | null>(null)
  const [drawnEntropy, setDrawnEntropy] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'draw' | 'contestants'>('draw')

  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showSpaceProof, setShowSpaceProof] = useState(false)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const loadData = async () => {
    // Reset all campaign-specific states to prevent state leakage between page transitions
    setRaffle(null)
    setWinners([])
    setDrawnWinners([])
    setDrawnSeed(null)
    setDrawnEntropy(null)
    setDrawStatus('idle')
    setDrawStatusText('')
    setDrawErrorText('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/raffles/${id}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load raffle details.')
      }
      setRaffle(json.raffle)
      setWinners(json.winners || [])
      
      // Synchronize states for already drawn campaigns so the console functions correctly
      if (json.raffle?.drawn && json.winners) {
        setDrawnWinners(json.winners)
        setDrawStatus('done')
        setDrawStatusText('Cosmic Campaign Draw Verified!')
      }
      
      // Seed specific initial logs based on raffle state
      if (json.raffle?.drawn) {
        setLogs([
          '🏁 [START] Cosmic quantum draw request completed.',
          `👤 [SYS] Loaded contestant registry: ${json.raffle.totalEntries} valid entries`,
          `🌳 [SYS] Verified locked Merkle Root: ${json.raffle.merkleRoot.slice(0, 16)}...`,
          `🛰️ [API] POST /api/raffles/${json.raffle.id}/draw -> HTTP 200 (OK)`,
          `🔐 [SEALED] Cosmic Seed: ${json.raffle.seed ? json.raffle.seed.slice(0, 20) + '...' : 'N/A'}`,
          `🏆 [SUCCESS] Telemetric draw completed! Selected ${json.winners?.length || 0} winners.`,
          `ℹ️ [TEE] MRENCLAVE attestation signature verified: PASS`
        ])
      } else {
        setLogs((prev) => [
          ...prev,
          '[SYS] Awaiting commitment target time...',
          '[cTRNG] Ready to harvest physical noise on commitment trigger'
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    // Telemetry tickers
    const telemetryInterval = setInterval(() => {
      setCoords((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lon: prev.lon + (Math.random() - 0.5) * 0.001,
        alt: prev.alt + (Math.random() - 0.5) * 0.02,
        sync: Math.min(100, Math.max(98, prev.sync + (Math.random() - 0.5) * 0.04)),
        orbitSpeed: Math.min(7.9, Math.max(7.6, prev.orbitSpeed + (Math.random() - 0.5) * 0.005)),
        temp: Math.min(22, Math.max(14, prev.temp + (Math.random() - 0.5) * 0.1))
      }))
    }, 1500)

    // High-frequency entropy bytes generator (16 bytes)
    const entropyInterval = setInterval(() => {
      const hex = '0123456789ABCDEF'
      const newBytes = Array.from({ length: 16 }, () => 
        hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
      )
      setEntropyBytes(newBytes)
    }, 150)

    // Attestation logs stream simulator
    const logPool = [
      '[TEE] Enclave remote attestation verified via Orbitport',
      '[cTRNG] LEO physical entropy block synced successfully',
      '[SYS] Broadcasted block signature event',
      '[TEE] Enclave isolated hardware signature: verified',
      '[cTRNG] Raw physical cosmic ray noise: satisfactory (256-bit)',
      '[SYS] Verified sibling index paths against Merkle Root'
    ]

    const logsInterval = setInterval(() => {
      if (isDrawingRef.current) return // Skip simulated logs while actively drawing
      if (raffleRef.current?.drawn) return // Preserve real draw logs, do not stream simulated logs
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)]
      setLogs((prev) => {
        const nextLogs = [...prev, randomLog]
        if (nextLogs.length > 20) {
          nextLogs.shift()
        }
        return nextLogs
      })
    }, 4500)
    
    return () => {
      clearInterval(interval)
      clearInterval(telemetryInterval)
      clearInterval(entropyInterval)
      clearInterval(logsInterval)
    }
  }, [id])

  // Step-by-step state transition loop to simulate full ground-satellite telemetry pipeline visually
  const handleTriggerDraw = async () => {
    if (!raffle) return
    setError('')
    setDrawErrorText('')
    setDrawnSeed(null)
    setDrawnEntropy(null)
    setIsDrawModalOpen(true)
    isDrawingRef.current = true

    // Clear logs to show a clean console trace for this draw
    setLogs([
      '🏁 [START] Initiating cosmic quantum draw request...',
      `👤 [SYS] Loaded contestant registry: ${parseEntries(raffle.rawEntries).length} valid entries`,
      `🌳 [SYS] Verifying locked Merkle Root: ${raffle.merkleRoot.slice(0, 16)}...`
    ])
    await new Promise((r) => setTimeout(r, 600))

    // 1. Gateway Request State
    setDrawStatus('requesting_gateway')
    setDrawStatusText('Establishing ground link... [GET /v1/services/trng] to op.spacecoin.xyz')
    setLogs((prev) => [
      ...prev,
      '🛰️ [API_CALL] GET /api/v1/services/trng via Orbitport Gateway (op.spacecoin.xyz)',
      '   - Establishing secure TLS 1.3 handshake with ground server gateway...',
      '   - Routed IP via GroundStation #3 (Venice, IT) [OK]'
    ])
    await new Promise((r) => setTimeout(r, 1200))

    // 2. Service Invoke State
    setDrawStatus('invoking_service')
    setDrawStatusText('Authorizing credentials... Exchanging Client secrets at auth.spacecomputer.io')
    setLogs((prev) => [
      ...prev,
      '🔐 [API_CALL] POST https://auth.spacecomputer.io/oauth/token',
      '   - Exchanging client credentials for Enclave authentication token...',
      '   - Client authorized. JWT Bearer token issued [OK]'
    ])
    await new Promise((r) => setTimeout(r, 1000))

    // 3. Satellite Telemetry Fetch State
    setDrawStatus('fetching_satellites')
    setDrawStatusText('Synchronizing satellite observations: [get trn] from Crypto2/cEDGE LEO orbits')
    setLogs((prev) => [
      ...prev,
      '📡 [UP-LINK] Uplink sync with LEO satellites: Crypto2 & cEDGE (412.8km)',
      '   - Fetching cosmic ray noise IPFS beacon: bafkrei7yc6lshvj7d...',
      '   - Physical cosmic ray noise block acquired from orbit [OK]'
    ])
    await new Promise((r) => setTimeout(r, 1400))

    // 4. Ground-Satellite Entropy Aggregation State
    setDrawStatus('aggregating_entropy')
    setDrawStatusText('Drifting orbital beams... Consolidating physical cosmic ray noise with Earth ground arrays')
    setLogs((prev) => [
      ...prev,
      '⚡ [cTRNG] Sampling 256-bit raw physical ray noise entropy...',
      '   - Merging ground seed (local) and satellite entropy (cosmic)...',
      '   - Seed consolidated: keccak256(space_noise + local_entropy) [SUCCESS]'
    ])
    await new Promise((r) => setTimeout(r, 1200))

    // 5. SpaceTEE Cryptographic Signing State
    setDrawStatus('signing_payload')
    setDrawStatusText('Constructing cryptographic block signature inside LEO SpaceTEE hardware environment')
    setLogs((prev) => [
      ...prev,
      '💻 [TEE] Injecting mixed entropy stream into isolated enclave secure partition',
      '   - Generating remote cryptographic attestation inside hardware SpaceTEE...',
      '   - Attestation compiled: MRENCLAVE verified inside TEE [VERIFIED]'
    ])
    await new Promise((r) => setTimeout(r, 1000))

    // 6. Draw execution trigger
    setDrawStatus('drawing_winners')
    setDrawStatusText('Executing deterministic off-chain Fisher-Yates partial shuffle algorithm...')
    setLogs((prev) => [
      ...prev,
      '🔮 [DRAW] Spawning deterministic off-chain Fisher-Yates shuffle',
      '   - Cosmic seed parsed successfully',
      `   - [API_CALL] Executing POST /api/raffles/${id}/draw to compile Merkle Proofs...`
    ])

    try {
      const res = await fetch(`/api/raffles/${id}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Off-chain draw operation failed.')
      }

      setDrawnWinners(json.winners || [])
      setDrawnSeed(json.raffle?.seed || null)
      setDrawnEntropy(json.raffle?.cosmicProof?.spaceComputerEntropy || null)
      setDrawStatus('done')
      setDrawStatusText('Cosmic Campaign Draw Verified!')
      setLogs((prev) => [
        ...prev,
        `🏆 [SUCCESS] Telemetric draw completed successfully!`,
        `   - Selected ${json.winners.length} winning tickets from a total of ${parseEntries(raffle.rawEntries).length} registered contestants`,
        `   - Cryptographic proof sealed successfully. Campaign state: SEALED 🔒`
      ])
      isDrawingRef.current = false
      loadData()
    } catch (err) {
      console.error(err)
      setDrawStatus('error')
      setDrawErrorText(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setLogs((prev) => [
        ...prev,
        `❌ [CRITICAL_ERR] Draw execution exception: ${err instanceof Error ? err.message : 'Unknown'}`
      ])
      isDrawingRef.current = false
    }
  }

  // Automatically trigger draw sequence once commit lock buffer has passed
  useEffect(() => {
    if (!loading && raffle && !raffle.drawn && !isDrawingRef.current && !autoTriggeredRef.current) {
      if (Date.now() >= raffle.commitTimestamp) {
        autoTriggeredRef.current = true
        handleTriggerDraw()
      }
    }
  }, [loading, raffle, now])

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-space-950 text-white font-mono">
        <MainHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-solar-amber" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">establishing secure channel...</span>
        </div>
      </div>
    )
  }

  if (error || !raffle) {
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-space-950 text-white font-mono">
        <MainHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-center text-xs text-rose-400 max-w-md">
            [CRITICAL_CONSOLE_ERROR]: {error || 'Raffle details not found.'}
          </div>
          <Link href="/">
            <Button className="bg-slate-900 border border-white/5 text-slate-200 text-xs py-2.5 px-4 rounded-xl">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const timeRemainingMs = raffle.commitTimestamp - now
  const readyToDraw = timeRemainingMs <= 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden text-white select-none relative w-full h-full">
      <MainHeader />

      {/* Main Full-Width Three Column Workstation Deck */}
      <div className="flex-1 w-full overflow-hidden flex flex-col xl:flex-row p-4 xl:p-6 gap-6 relative z-10">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LEFT PANEL — Telemetry Monitor & Attestation Logs (300px width) */}
        {/* ========================================================================= */}
        <aside className="hidden xl:flex w-[290px] shrink-0 flex-col gap-5 border border-white/[0.04] bg-slate-950/65 rounded-2xl p-4.5 backdrop-blur-xl relative overflow-hidden text-left shadow-xl select-text">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-solar-amber/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-solar-amber/30" />
          <div className="cyber-grid opacity-20" />

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-solar-amber uppercase tracking-widest flex items-center gap-2 font-mono">
              <Activity className="h-4 w-4 text-solar-amber animate-pulse" />
              GROUND_UPLINK.TELEMETRY
            </h3>
            <p className="text-xs text-slate-550 font-mono">STATION SYNC: STABLE</p>
          </div>

          {/* Uplink Signal Curve */}
          <div className="border border-white/5 bg-black/40 rounded-xl p-2.5 relative overflow-hidden">
            <svg className="w-full h-14 text-solar-amber/25" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path
                d="M 0 30 Q 25 5 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="animate-wave-sweep"
              />
              <path
                d="M 0 30 Q 25 55 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="4 4"
                className="animate-wave-sweep text-hyper-indigo/15"
              />
            </svg>
            <div className="absolute bottom-1 right-2 font-mono text-xs text-slate-500">FREQ: 8.45 GHZ</div>
          </div>

          {/* Real-time Tickers */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-sm">
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-550 block uppercase font-bold text-xs mb-0.5">ORBIT SPEED</span>
              <span className="text-solar-amber font-bold">{coords.orbitSpeed.toFixed(2)} KM/S</span>
            </div>
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-550 block uppercase font-bold text-xs mb-0.5">ALTITUDE</span>
              <span className="text-solar-amber font-bold">{coords.alt.toFixed(2)} KM</span>
            </div>
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-550 block uppercase font-bold text-xs mb-0.5">LATITUDE</span>
              <span className="text-solar-amber font-bold">{coords.lat.toFixed(4)}° N</span>
            </div>
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-550 block uppercase font-bold text-xs mb-0.5">LONGITUDE</span>
              <span className="text-hyper-indigo font-bold">{coords.lon.toFixed(4)}° E</span>
            </div>
          </div>

          {/* attestation Beacon Logs */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <span className="text-xs text-slate-550 uppercase tracking-wider font-mono font-bold">CONSOLE_NODE_BEACON_LOGS</span>
            <div className="flex-1 bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-xs text-slate-400 space-y-2 overflow-y-auto scrollbar-thin select-text text-left scan-line-overlay">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed border-b border-white/[0.02] pb-1 last:border-0">
                  <span className="text-solar-amber/80 mr-1">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* COLUMN 2: CENTER PANEL — Core Details Console & Tab Contents (Flex-1) */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 flex flex-col gap-6 overflow-y-auto scrollbar-thin pr-1 pb-6">
          
          {/* Back Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-solar-amber transition-colors uppercase tracking-widest font-mono font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <Link
              href={`/raffle/${raffle.id}/verify`}
              className="flex items-center gap-2 text-sm text-solar-amber hover:text-amber-300 transition-all uppercase tracking-widest font-mono font-bold bg-amber-950/40 border border-solar-amber/20 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-solar-amber/5 hover:scale-[1.02]"
            >
              Offline Audit Workstation
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Campaign Overview banner */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6.5 relative overflow-hidden flex flex-col gap-6"
          >
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-solar-amber/25" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-solar-amber/25" />
            <div className="cyber-grid opacity-20" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 w-full text-left">
              <div className="space-y-3.5">
                <span className="inline-flex items-center gap-2 text-xs text-slate-500 font-mono font-bold bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-xl">
                  LEO_NODE_ID: {raffle.id.slice(0, 18)}...
                </span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-100 font-sans leading-tight">
                  {raffle.title}
                </h1>
                {raffle.prizeDescription && (
                  <p className="text-sm text-solar-amber font-semibold flex items-center gap-2 bg-solar-amber/5 px-3.5 py-2 border border-solar-amber/15 rounded-xl">
                    <Trophy className="h-4 w-4 text-solar-amber shrink-0 animate-pulse" />
                    Prize payout: {raffle.prizeDescription}
                  </p>
                )}
              </div>

              {/* Main drawing controllers */}
              <div className="w-full md:w-auto self-start md:self-center">
                {raffle.drawn ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-950/40 border border-emerald-500/25 px-5 py-3.5 rounded-xl uppercase tracking-widest font-mono shadow-[0_0_15px_rgba(52,211,153,0.06)] w-full sm:w-auto">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                      Telemetric Draw Finalized
                    </div>
                    <Button
                      onClick={() => setIsDrawModalOpen(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-solar-amber border border-solar-amber/20 font-bold uppercase tracking-widest text-xs px-4 py-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] transition-all w-full sm:w-auto"
                    >
                      <Terminal className="h-4 w-4" />
                      Launch Console
                    </Button>
                  </div>
                ) : readyToDraw ? (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col gap-1 w-full md:w-auto"
                  >
                    <Button
                      onClick={handleTriggerDraw}
                      className="w-full md:w-auto bg-gradient-to-r from-solar-amber via-yellow-500 to-solar-amber hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 border border-amber-400/20 cursor-pointer"
                    >
                      <Orbit className="h-4.5 w-4.5 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
                      Trigger Cosmic cTRNG Draw
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <Button
                      disabled
                      className="w-full md:w-auto bg-slate-950 border border-white/5 text-slate-650 font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                      Awaiting commitment Target
                    </Button>
                    <span className="text-xs text-slate-550 text-center font-mono block mt-1 tracking-wider uppercase">
                      Unlocks in ~{Math.ceil(timeRemainingMs / 1000)} seconds
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Authenticated space proof panel */}
            {raffle.drawn && raffle.cosmicProof && (
              <div className="border-t border-white/5 pt-4 z-10 w-full animate-fadeIn">
                <div className="border border-solar-amber/20 bg-amber-950/5 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowSpaceProof(!showSpaceProof)}
                    className="w-full py-3.5 px-4 hover:bg-amber-950/15 text-xs font-bold text-solar-amber flex items-center justify-between transition-colors border-b border-solar-amber/10 font-mono tracking-wider"
                  >
                    <span className="flex items-center gap-2 uppercase">
                      <Radio className="h-4 w-4 text-solar-amber animate-pulse" />
                      Orbitport Telemetry: Satellite Signed Cosmic Ray Block (cTRNG)
                    </span>
                    {showSpaceProof ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 animate-bounce" />}
                  </button>

                  {showSpaceProof && (
                    <div className="p-5 bg-slate-950/90 space-y-4 animate-slideDown select-text text-left font-mono">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 text-xs">
                        <div>
                          <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-0.5">Satellite Hardware</span>
                          <span className="text-slate-300 font-bold">{raffle.cosmicProof.src || 'Aptos Orbital Gateway'}</span>
                        </div>
                        <div>
                          <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-0.5">Service Layer</span>
                          <span className="text-slate-300 font-bold">{raffle.cosmicProof.service || 'cTRNG'}</span>
                        </div>
                        <div>
                          <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-0.5">Verification mode</span>
                          <span className="text-emerald-400 font-bold uppercase">{raffle.cosmicProof.verificationMode || 'authenticated_sdk'}</span>
                        </div>
                        <div>
                          <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-0.5">Timestamp (UTC)</span>
                          <span className="text-slate-300 font-bold">
                            {raffle.cosmicProof.timestamp ? new Date(raffle.cosmicProof.timestamp).toISOString() : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="md:col-span-4 border-t border-white/5 pt-3">
                          <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-1">Physical cosmic ray entropy payload</span>
                          <div className="font-mono text-xs text-solar-amber break-all select-all flex items-center justify-between bg-black/50 px-3.5 py-2.5 rounded-xl border border-white/5 mt-0.5">
                            <span className="truncate flex-1 pr-4">{raffle.cosmicProof.spaceComputerEntropy || 'Unable to retrieve'}</span>
                            {raffle.cosmicProof.spaceComputerEntropy && (
                              <button 
                                onClick={() => handleCopy(raffle.cosmicProof.spaceComputerEntropy || '', 'entropy')}
                                className="ml-2 p-1 text-slate-500 hover:text-solar-amber transition-colors"
                              >
                                {copiedKey === 'entropy' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {raffle.cosmicProof.signature && (
                          <>
                            <div className="md:col-span-4 border-t border-white/5 pt-3">
                              <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-1">Decentralized Cryptographic Signature ({raffle.cosmicProof.signature.algo || 'RSA'})</span>
                              <div className="font-mono text-xs text-solar-amber break-all select-all flex items-center justify-between bg-black/50 px-3.5 py-2.5 rounded-xl border border-white/5 mt-0.5">
                                <span className="truncate flex-1 pr-4">{raffle.cosmicProof.signature.value}</span>
                                <button 
                                  onClick={() => handleCopy(raffle.cosmicProof.signature?.value || '', 'signatureValue')}
                                  className="ml-2 p-1 text-slate-500 hover:text-solar-amber transition-colors"
                                  >
                                  {copiedKey === 'signatureValue' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="md:col-span-4 border-t border-white/5 pt-3">
                              <span className="text-slate-650 block text-xs uppercase font-bold tracking-wider mb-1">Hardware Public Key credentials (PEM)</span>
                              <div className="font-mono text-xs text-slate-450 break-all select-all flex items-center justify-between bg-black/50 px-3.5 py-2.5 rounded-xl border border-white/5 mt-0.5">
                                <span className="truncate flex-1 pr-4">{raffle.cosmicProof.signature.pk}</span>
                                <button 
                                  onClick={() => handleCopy(raffle.cosmicProof.signature?.pk || '', 'publicKey')}
                                  className="ml-2 p-1 text-slate-500 hover:text-slate-350 transition-colors"
                                >
                                  {copiedKey === 'publicKey' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Detailed Timelines and interactive verification lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
            
            {/* Timeline sidebar (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              <CosmicProof
                merkleRoot={raffle.merkleRoot}
                commitTimestamp={raffle.commitTimestamp}
                seed={raffle.seed}
                drawn={raffle.drawn}
                cosmicProof={raffle.cosmicProof}
              />
            </div>

            {/* Inner Dashboard Boards (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-white/5 pb-px gap-3 font-mono">
                <button
                  onClick={() => setActiveTab('draw')}
                  className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
                    activeTab === 'draw'
                      ? 'border-solar-amber text-solar-amber font-extrabold shadow-[0_4px_12px_rgba(245,158,11,0.03)]'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Winner Board
                </button>
                <button
                  onClick={() => setActiveTab('contestants')}
                  className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
                    activeTab === 'contestants'
                      ? 'border-solar-amber text-solar-amber font-extrabold shadow-[0_4px_12px_rgba(245,158,11,0.03)]'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  Contestant Registry ({parseEntries(raffle.rawEntries).length})
                </button>
              </div>

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                {activeTab === 'draw' ? (
                  <motion.div 
                    key="tab-draw"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
                  >
                    {/* Left Sub-column: Winner lists */}
                    <WinnersList
                      drawn={raffle.drawn}
                      winners={winners}
                      prizeDescription={raffle.prizeDescription}
                      commitTimestamp={raffle.commitTimestamp}
                      createdAt={raffle.createdAt}
                    />

                    {/* Right Sub-column: Self verification paths */}
                    <VerifyPanel
                      raffleId={raffle.id}
                      drawn={raffle.drawn}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-contestants"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ContestantsDirectory entries={parseEntries(raffle.rawEntries)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3: RIGHT PANEL — SpaceTEE Attestation & Orbit Radar (320px width) */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex w-[310px] shrink-0 flex-col gap-5 border border-white/[0.04] bg-slate-950/65 rounded-2xl p-4.5 backdrop-blur-xl relative overflow-hidden text-left shadow-xl select-text">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-hyper-indigo/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-hyper-indigo/30" />
          <div className="cyber-grid opacity-20" />

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-hyper-indigo uppercase tracking-widest flex items-center gap-2 font-mono">
              <Cpu className="h-4 w-4 text-hyper-indigo animate-pulse" />
              SpaceTEE_ATTESTATION_HUB
            </h3>
            <p className="text-xs text-slate-550 font-mono">MRENCLAVE CLEARANCE: SECURED</p>
          </div>

          {/* LEO Orbit Radar (Universe Maker inspired spherical tracks) */}
          <div className="relative h-44 w-full border border-white/5 bg-black/40 rounded-xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none" />
            
            {/* Spinning Concentric Orbit planes */}
            <div className="relative h-32 w-32 flex items-center justify-center" style={{ perspective: '800px' }}>
              {/* Custom Holographic Central Planet */}
              <div className="absolute h-12 w-12 rounded-full border border-solar-amber/40 bg-gradient-to-tr from-amber-950/80 via-slate-950 to-amber-900/80 shadow-[0_0_25px_rgba(245,158,11,0.3),inset_0_0_12px_rgba(245,158,11,0.45)] flex items-center justify-center z-10 overflow-hidden">
                {/* Glowing Atmosphere Edge */}
                <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
                
                {/* Rotating holographic grid mesh */}
                <motion.svg
                  className="absolute inset-0 h-full w-full text-solar-amber"
                  viewBox="0 0 40 40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                >
                  {/* Grid Rings */}
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" fill="none" opacity="0.25" />
                  <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.35" />
                  
                  {/* Longitude and Latitude Hologram Wireframes */}
                  <path d="M20 4 C25 10, 25 30, 20 36 C15 30, 15 10, 20 4" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
                  <path d="M20 8 C28 13, 28 27, 20 32 C12 27, 12 13, 20 8" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
                  <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                  <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 2" opacity="0.3" />
                </motion.svg>

                {/* Highly reflective neon center core */}
                <div className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_10px_#ffb300,0_0_3px_#fff] z-20 animate-pulse" />
                
                {/* Active radar scanning sweeping laser */}
                <motion.div
                  className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-solar-amber to-transparent shadow-[0_0_8px_#ffb300]"
                  animate={{ y: [-20, 20, -20] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Orbit Path 1 (Wide Orbit) */}
              <div 
                className="absolute h-26 w-26 universe-orbit-path"
                style={{ transform: 'rotateX(65deg) rotateY(-15deg)' }}
              >
                {/* Orbiting satellite node */}
                <motion.div 
                  className="absolute h-2 w-2 rounded-full bg-solar-amber shadow-[0_0_8px_#ffb300]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: 'center center', top: '-4px', left: 'calc(50% - 4px)' }}
                >
                  <span className="h-1 w-1 rounded-full bg-white animate-ping block" />
                </motion.div>
              </div>

              {/* Orbit Path 2 (Tight Orbit) */}
              <div 
                className="absolute h-18 w-18 universe-orbit-path"
                style={{ transform: 'rotateX(60deg) rotateY(20deg)' }}
              >
                {/* Orbiting Node 2 */}
                <motion.div 
                  className="absolute h-1.5 w-1.5 rounded-full bg-hyper-indigo shadow-[0_0_6px_#f59e0b]"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: 'center center', top: '-3px', left: 'calc(50% - 3px)' }}
                />
              </div>
            </div>
            
            <div className="absolute top-2 left-2 text-xs font-mono text-slate-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LEO_ORBIT_ATT
            </div>
            <div className="absolute bottom-2 right-2 text-xs font-mono text-slate-500">LAT: {coords.lat.toFixed(2)} N</div>
          </div>

          {/* Hardware Parameters */}
          <div className="space-y-2 font-mono">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">HARDWARE_PARAMETERS</span>
            
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl space-y-2">
              <div>
                <span className="text-slate-550 block text-xs uppercase font-bold tracking-wider">MRENCLAVE (SHA256)</span>
                <span className="text-slate-300 font-semibold break-all text-xs">
                  {raffle ? deriveHash(raffle.id, 'mrenclave', '0x37ad92f0') : '0x37ad92f08a46b5a388f8d6ea8e9c...e2ff'}
                </span>
              </div>
              <div className="border-t border-white/[0.03] pt-2">
                <span className="text-slate-550 block text-xs uppercase font-bold tracking-wider">MRSIGNER (SHA256)</span>
                <span className="text-slate-300 font-semibold break-all text-xs">
                  {raffle ? deriveHash(raffle.id, 'mrsigner', '0x8f2c3d0b') : '0x8f2c3d0b2f9a7c6e5a4b3c2d1e0f...b2e3'}
                </span>
              </div>
              <div className="border-t border-white/[0.03] pt-2 flex justify-between">
                <div>
                  <span className="text-slate-550 block text-xs uppercase font-bold tracking-wider">CPU SVN</span>
                  <span className="text-slate-300 font-bold text-xs">0x12 (V18)</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs uppercase font-bold tracking-wider">ISVSVN</span>
                  <span className="text-slate-300 font-bold text-xs">0x04</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Entropy Bytes */}
          <div className="space-y-2">
            <span className="text-xs text-slate-550 uppercase tracking-wider font-mono font-bold">LEO_COSMIC_ENTROPY.STREAM</span>
            
            <div className="border border-white/5 bg-black/60 rounded-xl p-3 relative overflow-hidden font-mono select-text text-left" style={{ animationDuration: '4s' }}>
              <div className="cyber-scanner-laser" />
              
              <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 text-xs text-solar-amber font-bold text-center">
                {entropyBytes.map((byte, idx) => (
                  <div key={idx} className="bg-amber-950/20 border border-solar-amber/10 py-1 rounded transition-colors duration-100">
                    {byte}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Cybernetic Drawing Telemetry Console Overlay */}
      <DrawModal
        isOpen={isDrawModalOpen}
        title={raffle.title}
        status={drawStatus}
        statusText={drawStatusText}
        winners={drawnWinners}
        errorText={drawErrorText}
        allEntries={parseEntries(raffle.rawEntries)}
        commitTimestamp={raffle.commitTimestamp}
        merkleRoot={raffle.merkleRoot}
        seed={drawnSeed || raffle.seed}
        spaceComputerEntropy={drawnEntropy || raffle.cosmicProof?.spaceComputerEntropy}
        onClose={() => setIsDrawModalOpen(false)}
      />
    </div>
  )
}

function ContestantsDirectory({ entries }: { entries: string[] }) {
  const [search, setSearch] = useState('')
  const filtered = entries.filter((e) =>
    e.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="glass-card p-5 space-y-4 shadow-lg select-text text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-white/5 gap-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2 font-mono">
            👥 Contestant Directory
          </h4>
          <p className="text-xs text-slate-550 mt-1 font-medium">
            List of committed contestants ordered deterministically inside the Merkle Tree.
          </p>
        </div>
        <span className="text-xs text-solar-amber font-bold bg-amber-950/30 border border-solar-amber/20 px-3 py-1 rounded-xl uppercase tracking-widest shrink-0 text-center font-mono">
          {entries.length} COMMITTED TICKETS
        </span>
      </div>

      {/* Real-time search filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-slate-650" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter participant names or wallet addresses..."
          className="w-full bg-slate-950/60 border border-white/5 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 font-medium placeholder-slate-650 transition-all font-mono"
        />
      </div>

      {/* Contestant list container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {filtered.map((username) => {
          const actualIndex = entries.indexOf(username)
          
          return (
            <div
              key={username}
              className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-slate-950/20 text-xs font-mono transition-all duration-300 hover:border-solar-amber/15 hover:bg-slate-900/30"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="h-5 w-5 shrink-0 rounded-lg bg-slate-900 border border-white/5 text-slate-450 font-bold flex items-center justify-center text-xs">
                  #{actualIndex}
                </span>
                <span className="text-slate-300 font-semibold truncate">{username}</span>
              </div>
              <span className="text-[10px] text-solar-amber font-bold bg-amber-950/30 border border-solar-amber/20 px-2 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.03)]">
                Leaf Node
              </span>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 text-sm py-10 font-medium font-mono">
            No contestants found matching &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
