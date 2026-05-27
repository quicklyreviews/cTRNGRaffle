'use client'

import { useState } from 'react'
import { FileSpreadsheet, AlertCircle, Loader2, ArrowLeft, ArrowRight, ShieldCheck, Cpu, TreeDeciduous, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'motion/react'

interface Step2Data {
  rawInput: string
  entries: string[]
  merkleRoot: string
  commitTimestamp: number
  totalEntries: number
}

interface Step2ListProps {
  winnerCount: number
  data: Step2Data
  onPrev: () => void
  onNext: (updatedData: Step2Data) => void
}

export function Step2List({ winnerCount, data, onPrev, onNext }: Step2ListProps) {
  const [rawInput, setRawInput] = useState(data.rawInput)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState<Step2Data | null>(
    data.merkleRoot ? data : null
  )

  const handleValidate = async () => {
    setError('')
    setLoading(true)
    setPreviewData(null)

    if (!rawInput.trim()) {
      setError('Please enter or upload a list of contestants.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/raffles/prepare-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput,
          winnerCount,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Error preparing contestant list.')
      }

      setPreviewData({
        rawInput,
        entries: json.entries,
        merkleRoot: json.merkleRoot,
        commitTimestamp: json.commitTimestamp,
        totalEntries: json.totalEntries,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing.')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    if (previewData) {
      onNext(previewData)
    }
  }

  const formattedLockTime = previewData?.commitTimestamp ? new Date(previewData.commitTimestamp).toLocaleTimeString() : ''

  return (
    <div className="space-y-6 select-text text-left font-sans">
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-solar-amber drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]" />
            Contestant List committed entries <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-3 font-medium leading-relaxed">
            Enter one wallet address or username per line, or paste CSV contents. Sibling nodes are ordered deterministically and hashed sequentially. Duplicates are auto-pruned.
          </p>
          <Textarea
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value)
              setPreviewData(null) // clear preview if raw input changes
            }}
            placeholder="e.g.:&#10;user_alpha&#10;user_beta&#10;0x987654321...&#10;user_gamma,ticket_weight"
            rows={8}
            className="glass-input font-mono text-sm w-full bg-slate-950/80 text-slate-100 focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 transition-all placeholder-slate-500"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3.5 text-sm font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Processing Action keys */}
        {!previewData && (
          <Button
            type="button"
            onClick={handleValidate}
            disabled={loading || !rawInput.trim()}
            className="w-full bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/15 font-mono text-xs tracking-widest uppercase py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-solar-amber" />
                Constructing double-Keccak256 Merkle Tree...
              </span>
            ) : (
              'Compile contestant list'
            )}
          </Button>
        )}

        {/* Interactive visual preview panel and Merkle Tree diagram */}
        <AnimatePresence>
          {previewData && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 border border-solar-amber/15 bg-amber-950/5 rounded-2xl space-y-5 animate-fadeIn"
            >
              <div className="flex items-center gap-2 text-solar-amber font-bold text-sm font-mono uppercase tracking-widest">
                <ShieldCheck className="h-5 w-5 text-solar-amber animate-pulse" />
                <span>Contestant tree compiled successfully</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/12">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total committed:</span>
                  <strong className="text-slate-100 text-base">{previewData.totalEntries} entries</strong>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/12">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Winner Target count:</span>
                  <strong className="text-solar-amber text-base">{winnerCount} slots</strong>
                </div>
              </div>

              {/* 1. INTERACTIVE GLOWING MERKLE TREE CIRCUIT DIAGRAM (HTML/CSS ONLY) */}
              <div className="bg-slate-950/95 rounded-2xl p-4 border border-white/12 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Network className="h-3.5 w-3.5 text-solar-amber animate-pulse" />
                    Merkle Tree Cryptographic Diagram Preview:
                  </span>
                  <span>LEAF_COUNT: {previewData.totalEntries}</span>
                </div>

                {/* Nodes Tree Grid visualizer */}
                <div className="flex flex-col items-center gap-4 py-2 relative">
                  
                  {/* Tier 1: Root Node */}
                  <div className="flex flex-col items-center">
                    <div className="px-3.5 py-2 rounded-xl border border-solar-amber/40 bg-amber-950/40 text-solar-amber font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.2)] glow-text-amber truncate max-w-[200px]" title={previewData.merkleRoot}>
                      Root: {previewData.merkleRoot.slice(0, 10)}...{previewData.merkleRoot.slice(-6)}
                    </div>
                  </div>

                  {/* Tier 1 to 2 connector paths */}
                  <div className="h-3.5 w-[1px] bg-solar-amber/35 -mt-2 -mb-2" />

                  {/* Tier 2: Sibling Hashes (Calculated parents) */}
                  <div className="grid grid-cols-2 gap-x-12 w-full text-center relative px-4">
                    {/* Visual branch path line */}
                    <div className="absolute left-[25%] right-[25%] top-0 h-[1px] bg-white/10 -z-10" />

                    <div className="flex flex-col items-center">
                      <div className="h-2 w-[1px] bg-white/10 mb-1" />
                      <div className="px-2 py-1.5 rounded-lg border border-hyper-indigo/35 bg-amber-950/30 text-hyper-indigo font-bold text-[10px] truncate max-w-[120px]">
                        Parent_Hash_L
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-[1px] bg-white/10 mb-1" />
                      <div className="px-2 py-1.5 rounded-lg border border-hyper-indigo/35 bg-amber-950/30 text-hyper-indigo font-bold text-[10px] truncate max-w-[120px]">
                        Parent_Hash_R
                      </div>
                    </div>
                  </div>

                  {/* Tier 3: Leaf nodes */}
                  <div className="grid grid-cols-4 gap-2 w-full text-center relative mt-1">
                    {previewData.entries.slice(0, 4).map((entry, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="h-2.5 w-[1px] bg-white/10 mb-1" />
                        <div className="px-1.5 py-1 rounded bg-slate-900 border border-white/12 text-slate-350 text-[9px] truncate w-full text-center font-bold">
                          Leaf #{idx}: {entry.slice(0, 6)}..
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {previewData.entries.length > 4 && (
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold pt-1">
                      ... and {previewData.entries.length - 4} other contestant leaves securely hashed ...
                    </div>
                  )}
                </div>
              </div>

              {/* Target lock telemetries */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/12 text-sm font-mono">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1.5">Commitment lock target telemetry:</span>
                <span className="text-hyper-indigo font-extrabold text-xs">
                  Target Lock Time: {formattedLockTime}
                </span>
                <p className="text-slate-550 block mt-1 text-[10px] font-medium leading-normal">
                  (Buffer delay automatically set to 8 seconds into the future to completely protect cosmic observations against ground intercept front-running)
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation action keys */}
      <div className="flex justify-between items-center pt-2 font-mono">
        <Button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-white/12 text-slate-400 text-xs uppercase tracking-widest font-bold px-4 py-3 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Back step
        </Button>

        <Button
          type="button"
          onClick={handleNextStep}
          disabled={loading || !previewData}
          className="flex items-center gap-2 bg-gradient-to-r from-solar-amber via-hyper-indigo to-solar-amber hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/10 disabled:opacity-50 hover:scale-[1.02] transition-all cursor-pointer"
        >
          Verify details
          <ArrowRight className="h-4 w-4 stroke-[3px]" />
        </Button>
      </div>
    </div>
  )
}
