'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { MainHeader } from '@/components/shell/MainHeader'
import { Step1Info } from '@/components/raffle/CreateForm/Step1Info'
import { Step2List } from '@/components/raffle/CreateForm/Step2List'
import { Step3Confirm } from '@/components/raffle/CreateForm/Step3Confirm'
import { Orbit, Sparkles, ArrowLeft, Radio } from 'lucide-react'

export default function CreateRafflePage() {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 state
  const [infoData, setInfoData] = useState({
    title: '',
    description: '',
    prizeDescription: '',
    winnerCount: 1,
  })

  // Step 2 state
  const [listData, setListData] = useState({
    rawInput: '',
    entries: [] as string[],
    merkleRoot: '',
    commitTimestamp: 0,
    totalEntries: 0,
  })

  const handleStep1Next = (updatedData: Partial<typeof infoData>) => {
    setInfoData((prev) => ({ ...prev, ...updatedData }))
    setCurrentStep(2)
  }

  const handleStep2Next = (updatedData: typeof listData) => {
    setListData(updatedData)
    setCurrentStep(3)
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden select-none">
      <MainHeader />

      <div className="flex-1 overflow-y-auto py-10 px-6 scrollbar-thin relative pb-16 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl space-y-8 relative">
          
          {/* Header Dashboard section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5 text-left"
          >
            <div className="space-y-1">
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2.5">
                <Orbit className="h-5 w-5 text-solar-amber animate-spin" style={{ animationDuration: '10s' }} />
                Campaign Creation Console
              </h1>
              <p className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider">
                Establish a cryptographically locked cTRNG raffle campaign in LEO orbit.
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-solar-amber transition-colors uppercase tracking-widest font-mono font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cancel &amp; exit
            </Link>
          </motion.div>

          {/* Glowing Orbital Step link Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
            className="grid grid-cols-3 gap-3 relative font-mono text-[9px]"
          >
            {[
              { num: 1, label: 'Configuration', glyph: '⚙️' },
              { num: 2, label: 'Contestants', glyph: '👥' },
              { num: 3, label: 'LEO Deploy', glyph: '🚀' },
            ].map((step) => {
              const active = currentStep === step.num
              const done = currentStep > step.num

              return (
                <div
                  key={step.num}
                  className={`relative flex flex-col gap-2 p-3.5 rounded-2xl border transition-all duration-300 ${
                    active
                      ? 'border-solar-amber/50 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                      : done
                      ? 'border-emerald-500/35 bg-emerald-950/15'
                      : 'border-white/10 bg-slate-900/40 opacity-80'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="step-glow"
                      className="absolute inset-0 rounded-2xl border border-solar-amber/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span
                      className={`h-5 w-5 rounded-lg text-[9px] font-bold flex items-center justify-center border font-mono ${
                        active
                          ? 'bg-solar-amber text-slate-950 border-solar-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : done
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-900 text-slate-400 border-white/10'
                      }`}
                    >
                      {step.num}
                    </span>
                    <span className="text-[11px]">{step.glyph}</span>
                  </div>
                  <span
                    className={`relative text-[8px] font-extrabold uppercase tracking-widest text-left mt-1 ${
                      active ? 'text-solar-amber glow-text-amber' : done ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </motion.div>

          {/* Wizard Card Body */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
            className="glass-card p-6 md:p-8 relative overflow-hidden bg-slate-950/80 rounded-2xl text-left"
          >
            {/* Top divider light */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-solar-amber/25 to-transparent" />

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <Step1Info data={infoData} onNext={handleStep1Next} />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <Step2List
                    winnerCount={infoData.winnerCount}
                    data={listData}
                    onPrev={handlePrevStep}
                    onNext={handleStep2Next}
                  />
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <Step3Confirm
                    infoData={infoData}
                    listData={listData}
                    onPrev={handlePrevStep}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
