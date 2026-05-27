'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Orbit, Plus, Loader2, Sparkles, HelpCircle, Radio, ShieldCheck, Database, Compass, Trophy, Terminal, Globe, Server, Satellite, Cpu, Activity } from 'lucide-react'
import { MainHeader } from '@/components/shell/MainHeader'
import { RaffleCard } from '@/components/raffle/RaffleCard'
import { Button } from '@/components/ui/button'

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

export default function RaffleLandingPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Dynamic Telemetry Tickers
  const [coords, setCoords] = useState({ lat: 45.1824, lon: 12.3156, alt: 412.85, sync: 99.82, orbitSpeed: 7.78, temp: 18.5 })
  
  // Real-time scrolling logs
  const [logs, setLogs] = useState<string[]>([
    '[SYS] Ground control link established with Gateway',
    '[LEO] Syncing with active satellite observation nodes...',
    '[TEE] Attestation credentials verified: OK',
    '[cTRNG] Physical cosmic ray sensors calibrated',
    '[SYS] Telemetry systems stable. Ground latency: 124ms'
  ])

  // High-frequency Entropy Ticker Bytes
  const [entropyBytes, setEntropyBytes] = useState<string[]>([])

  const fetchRaffles = async () => {
    try {
      const res = await fetch('/api/raffles/list', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load raffle list.')
      }
      setRaffles(json.raffles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRaffles()

    // 1. Telemetry tick updates
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

    // 2. High-frequency entropy bytes generator (16 bytes)
    const entropyInterval = setInterval(() => {
      const hex = '0123456789ABCDEF'
      const newBytes = Array.from({ length: 16 }, () => 
        hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
      )
      setEntropyBytes(newBytes)
    }, 150)

    // 3. Scrollable live space logs simulator
    const logPool = [
      '[TEE] Enclave cryptographic signature check: verified',
      '[cTRNG] Block entropy threshold satisfied (256-bit)',
      '[LEO] observation buffer beam synced with op.spacecoin.xyz',
      '[SYS] Auth token refresh at auth.spacecomputer.io',
      '[LEO] Fisher-Yates seed attestation broadcast sent',
      '[cTRNG] true random packet injected to Merkle leaf index',
      '[TEE] Hardware enclave thermal boundaries within 18°C',
      '[SYS] Orbitport API channel active [GET /v1/services/trng]'
    ]

    const logsInterval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)]
      setLogs((prev) => {
        const nextLogs = [...prev, randomLog]
        if (nextLogs.length > 20) {
          nextLogs.shift()
        }
        return nextLogs
      })
    }, 3500)

    return () => {
      clearInterval(telemetryInterval)
      clearInterval(entropyInterval)
      clearInterval(logsInterval)
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden select-none relative w-full h-full">
      {/* Shell header */}
      <MainHeader />

      {/* Main Full-Width Three Column Workstation Deck */}
      <div className="flex-1 w-full overflow-hidden flex flex-col xl:flex-row p-4 xl:p-6 gap-6 relative z-10">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LEFT PANEL — Telemetry Monitor & Log Stream (300px width / hidden on tablet/mobile) */}
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
            <p className="text-xs text-slate-500 font-mono">STATION SYNC: STABLE</p>
          </div>

          {/* Ground Uplink Signal Sweep (SVG Wave Graph) */}
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

          {/* Live Gaging Grid */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-sm">
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-500 block uppercase font-bold text-xs mb-0.5">ORBIT SPEED</span>
              <span className="text-solar-amber font-bold">{coords.orbitSpeed.toFixed(2)} KM/S</span>
            </div>
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-500 block uppercase font-bold text-xs mb-0.5">ALTITUDE</span>
              <span className="text-solar-amber font-bold">{coords.alt.toFixed(2)} KM</span>
            </div>
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-500 block uppercase font-bold text-xs mb-0.5">HARDWARE TEMP</span>
              <span className="text-hyper-indigo font-bold">+{coords.temp.toFixed(1)} °C</span>
            </div>
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl">
              <span className="text-slate-500 block uppercase font-bold text-xs mb-0.5">LINK RATING</span>
              <span className="text-emerald-400 font-bold">EXCELLENT</span>
            </div>
          </div>

          {/* Real-time Ticking Logs Terminal */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono font-bold">CRYPTOGRAPHIC_BEACON_LOGS</span>
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
        {/* COLUMN 2: CENTER PANEL — Core Command Console & Campaign Registry (Flex-1) */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 flex flex-col gap-6 overflow-y-auto scrollbar-thin pr-1 pb-6">
          
          {/* Dashboard Title & Hero Command Banner */}
          <section className="relative glass-panel rounded-2xl p-6.5 overflow-hidden text-left border border-white/[0.04] shadow-xl">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-solar-amber/20" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-solar-amber/20" />
            <div className="cyber-grid opacity-20" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-4 max-w-2xl">
                <span className="inline-flex items-center gap-2 text-sm text-solar-amber font-mono font-bold bg-amber-950/40 border border-solar-amber/20 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                  <Satellite className="h-3.5 w-3.5 animate-pulse text-solar-amber" />
                  Orbital Telemetry Synced with SpaceTEE Enclave
                </span>
                
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-slate-100 font-sans leading-tight">
                    Cosmic <span className="bg-gradient-to-r from-solar-amber via-hyper-indigo to-solar-amber bg-clip-text text-transparent glow-text-amber font-black">cTRNG</span> Raffle
                  </h1>
                  <p className="text-base text-slate-400 leading-relaxed font-medium">
                    Provably fair, decentralized off-chain raffle campaigns powered by SpaceComputer LEO satellite arrays. By combining offline committed Merkle roots with hardware cosmic ray entropy signatures, every outcome is mathematically sealed inside secure orbital TEE hardware.
                  </p>
                </div>
              </div>

              {/* Action wizard button inside center column */}
              <Link href="/create" className="shrink-0 self-start md:self-center">
                <Button className="bg-gradient-to-r from-solar-amber via-hyper-indigo to-solar-amber hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-xl shadow-lg shadow-amber-500/15 flex items-center gap-2 border border-amber-400/20 transition-all duration-300 hover:shadow-amber-500/30 hover:scale-[1.02] cursor-pointer">
                  <Plus className="h-4.5 w-4.5 text-slate-950 stroke-[3px]" />
                  Launch Setup Wizard
                </Button>
              </Link>
            </div>
          </section>

          {/* Campaigns Registry Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
              <h2 className="text-base font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2.5 font-mono">
                <Orbit className="h-4.5 w-4.5 text-solar-amber animate-spin" style={{ animationDuration: '20s' }} />
                Active Campaigns Telemetry Registry
              </h2>
              
              <div className="flex items-center gap-3.5 font-mono text-xs text-slate-500">
                <span>CHANNELS: 5 ONLINE</span>
                <span>NODES: 4 SYNCED</span>
              </div>
            </div>

            {loading ? (
              /* Shimmer Loading Skeleton Cards! */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((item) => (
                  <div key={item} className="glass-card h-56 p-5 flex flex-col justify-between overflow-hidden border border-white/5 rounded-2xl relative">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-3 w-20 rounded shimmer-skeleton" />
                        <div className="h-5 w-12 rounded-lg shimmer-skeleton" />
                      </div>
                      <div className="h-5 w-44 rounded shimmer-skeleton" />
                      <div className="h-8 w-full rounded shimmer-skeleton" />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex gap-4">
                        <div className="h-3.5 w-14 rounded shimmer-skeleton" />
                        <div className="h-3.5 w-14 rounded shimmer-skeleton" />
                      </div>
                      <div className="h-3 w-10 rounded shimmer-skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-center text-sm text-rose-400 max-w-md mx-auto font-mono">
                [CRITICAL_SYSTEM_EXCEPTION]: {error}
              </div>
            ) : raffles.length === 0 ? (
              <motion.div
                className="border border-dashed border-white/10 backdrop-blur-xl bg-slate-950/20 rounded-2xl py-20 px-6 text-center space-y-5 max-w-xl mx-auto flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.4 }}
              >
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                  <HelpCircle className="h-6 w-6 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-slate-200 font-bold text-base uppercase tracking-wider">No Active Campaigns Registry</h4>
                  <p className="text-slate-550 text-sm max-w-xs mx-auto leading-relaxed">
                    Establish a secure orbit. Be the first to deploy a verifiable, cosmic random raffle campaign.
                  </p>
                </div>
                <Link href="/create">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-solar-amber font-bold text-xs uppercase tracking-widest py-3 px-5 border border-white/5 rounded-xl transition-all duration-300">
                    Launch Setup Wizard
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text">
                {raffles.map((raffle, i) => (
                  <motion.div
                    key={raffle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: i * 0.08,
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <RaffleCard raffle={raffle} />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3: RIGHT PANEL — SpaceTEE Attestation & Orbit Radar (320px width / hidden on tablet/mobile) */}
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
            <p className="text-xs text-slate-500 font-mono">MRENCLAVE CLEARANCE: SECURED</p>
          </div>

          {/* Dynamic LEO Satellite Orbit visualizer (Universe Maker inspired blue path graphic) */}
          <div className="relative h-44 w-full border border-white/5 bg-black/40 rounded-xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none" />
            
            {/* Spinning Radar concentric paths */}
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

              {/* Orbit Path 1 (Wide Gold Orbit) */}
              <div 
                className="absolute h-26 w-26 universe-orbit-path"
                style={{ transform: 'rotateX(65deg) rotateY(-15deg)' }}
              >
                {/* Orbiting node */}
                <motion.div 
                  className="absolute h-2 w-2 rounded-full bg-solar-amber shadow-[0_0_8px_#ffb300]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: 'center center', top: '-4px', left: 'calc(50% - 4px)' }}
                >
                  <span className="h-1 w-1 rounded-full bg-white animate-ping block" />
                </motion.div>
              </div>

              {/* Orbit Path 2 (Tight Amber Orbit) */}
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

          {/* SpaceTEE Hardware Attestation credentials */}
          <div className="space-y-2 font-mono">
            <span className="text-xs text-slate-550 uppercase tracking-wider font-bold">HARDWARE_PARAMETERS</span>
            
            <div className="border border-white/5 bg-slate-950/80 p-2.5 rounded-xl space-y-2">
              <div>
                <span className="text-slate-500 text-xs block uppercase font-bold tracking-wider">MRENCLAVE (SHA256)</span>
                <span className="text-slate-300 font-semibold break-all text-xs">0x37ad92f08a46b5a388f8d6ea8e9c...e2ff</span>
              </div>
              <div className="border-t border-white/[0.03] pt-2">
                <span className="text-slate-550 text-xs block uppercase font-bold tracking-wider">MRSIGNER (SHA256)</span>
                <span className="text-slate-300 font-semibold break-all text-xs">0x8f2c3d0b2f9a7c6e5a4b3c2d1e0f...b2e3</span>
              </div>
              <div className="border-t border-white/[0.03] pt-2 flex justify-between">
                <div>
                  <span className="text-slate-550 text-xs block uppercase font-bold tracking-wider">CPU SVN</span>
                  <span className="text-slate-300 font-bold text-xs">0x12 (V18)</span>
                </div>
                <div>
                  <span className="text-slate-550 text-xs block uppercase font-bold tracking-wider">ISVSVN</span>
                  <span className="text-slate-300 font-bold text-xs">0x04</span>
                </div>
              </div>
            </div>
          </div>

          {/* High-frequency raw entropy ticks */}
          <div className="space-y-2">
            <span className="text-xs text-slate-550 uppercase tracking-wider font-mono font-bold">LEO_COSMIC_ENTROPY.STREAM</span>
            
            <div className="border border-white/5 bg-black/60 rounded-xl p-3 relative overflow-hidden font-mono select-text text-left">
              {/* Micro scanning laser inside byte grids */}
              <div className="cyber-scanner-laser" />
              
              <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 text-xs text-solar-amber font-bold text-center">
                {entropyBytes.map((byte, idx) => (
                  <div key={idx} className="bg-amber-950/20 border border-solar-amber/10 py-1 rounded transition-colors duration-100 hover:text-white">
                    {byte}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
