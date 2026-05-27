'use client'

import { useState } from 'react'
import { Trophy, Gift, AlignLeft, Settings, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Step1Data {
  title: string
  description: string
  prizeDescription: string
  winnerCount: number
}

interface Step1InfoProps {
  data: Step1Data
  onNext: (updatedData: Partial<Step1Data>) => void
}

export function Step1Info({ data, onNext }: Step1InfoProps) {
  const [title, setTitle] = useState(data.title)
  const [description, setDescription] = useState(data.description)
  const [prizeDescription, setPrizeDescription] = useState(data.prizeDescription)
  const [winnerCount, setWinnerCount] = useState(data.winnerCount > 0 ? String(data.winnerCount) : '1')
  const [error, setError] = useState('')

  const maxDescLength = 260

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter the raffle campaign title.')
      return
    }

    const count = Number(winnerCount)
    if (isNaN(count) || count <= 0) {
      setError('Winner count must be a number greater than 0.')
      return
    }

    onNext({
      title: title.trim(),
      description: description.trim(),
      prizeDescription: prizeDescription.trim(),
      winnerCount: count,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-text text-left">
      <div className="space-y-5">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-solar-amber drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]" />
            Campaign Title <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Orbit Giga Giveaway #1"
            className="glass-input w-full bg-slate-950/80 text-slate-100 text-sm py-3.5 pl-3.5 focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 transition-all font-mono"
            required
          />
        </div>

        {/* Prize description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-solar-amber drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]" />
            Prize Reward Description <span className="text-slate-400 font-semibold">(Optional)</span>
          </label>
          <Input
            value={prizeDescription}
            onChange={(e) => setPrizeDescription(e.target.value)}
            placeholder="e.g., 200 USDC + 1 Astro-NFT"
            className="glass-input w-full bg-slate-950/80 text-slate-100 text-sm py-3.5 pl-3.5 focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 transition-all font-mono"
          />
        </div>

        {/* Winner Count */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-hyper-indigo drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]" />
            Winner Count Target <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <Input
            type="number"
            min="1"
            value={winnerCount}
            onChange={(e) => setWinnerCount(e.target.value)}
            placeholder="1"
            className="glass-input w-full bg-slate-950/80 text-slate-100 text-sm py-3.5 pl-3.5 focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 transition-all font-mono"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <AlignLeft className="h-4 w-4 text-slate-400" />
              Additional Details <span className="text-slate-400 font-semibold">(Optional)</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {description.length} / {maxDescLength} CHARS
            </span>
          </div>
          <Textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= maxDescLength) {
                setDescription(e.target.value)
              }
            }}
            placeholder="Describe this raffle campaign for your audience..."
            rows={3}
            className="glass-input w-full bg-slate-950/80 text-slate-100 text-sm py-3.5 pl-3.5 focus:border-solar-amber/40 focus:ring-1 focus:ring-solar-amber/30 transition-all font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 text-sm font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          [STEP_1_ERROR]: {error}
        </div>
      )}

      <div className="flex justify-end pt-2 font-mono">
        <Button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-solar-amber via-hyper-indigo to-solar-amber hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-300 flex items-center gap-1 hover:scale-[1.02] cursor-pointer"
        >
          Continue Step
          <ArrowRight className="h-4 w-4 stroke-[3px]" />
        </Button>
      </div>
    </form>
  )
}
