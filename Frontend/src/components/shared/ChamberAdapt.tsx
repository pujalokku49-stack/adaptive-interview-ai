import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/types'
import { Activity, Brain, Dna, Gauge, GitBranch, Network, Sparkles } from 'lucide-react'

/** Animated difficulty chip — morphs when adaptive bar changes */
export function AnimatedDifficultyBadge({
  difficulty,
  flash = false,
  className,
}: {
  difficulty: Difficulty
  flash?: boolean
  className?: string
}) {
  const styles: Record<Difficulty, string> = {
    easy: 'bg-helix-success/15 text-helix-success border-helix-success/30',
    medium: 'bg-helix-signal/15 text-helix-signal border-helix-signal/30',
    hard: 'bg-helix-copper/15 text-helix-copper border-helix-copper/30',
    expert: 'bg-helix-danger/15 text-helix-danger border-helix-danger/30',
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={difficulty}
        initial={{ opacity: 0, y: -8, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: flash ? [1, 1.08, 1] : 1,
          boxShadow: flash
            ? [
                '0 0 0 0 transparent',
                '0 0 20px -4px rgb(232 168 124 / 0.55)',
                '0 0 0 0 transparent',
              ]
            : '0 0 0 0 transparent',
        }}
        exit={{ opacity: 0, y: 8, scale: 0.9 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wider',
          styles[difficulty],
          className,
        )}
      >
        <Gauge className="h-3 w-3" />
        {difficulty}
      </motion.span>
    </AnimatePresence>
  )
}

const ADAPT_SURFACES = [
  { id: 'confidence', label: 'Confidence', icon: Activity },
  { id: 'dna', label: 'Candidate DNA', icon: Dna },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'memory', label: 'AI Memory', icon: Brain },
  { id: 'reasoning', label: 'Reasoning', icon: Sparkles },
  { id: 'timeline', label: 'Timeline', icon: GitBranch },
] as const

/** Cascade chips that light up when the chamber adapts after an answer */
export function AdaptCascadeBanner({
  visible,
  summary,
  activeIds,
}: {
  visible: boolean
  summary: string
  activeIds: string[]
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mb-4 rounded-xl border border-helix-signal/30 bg-helix-signal/8 px-3 py-3">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-helix-signal">
              Chamber adapting in real time
            </p>
            <p className="mt-1 text-xs text-helix-muted">{summary}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {ADAPT_SURFACES.map((s, i) => {
                const on = activeIds.includes(s.id)
                const Icon = s.icon
                return (
                  <motion.span
                    key={s.id}
                    initial={{ opacity: 0.35, scale: 0.92 }}
                    animate={{
                      opacity: on ? 1 : 0.4,
                      scale: on ? 1 : 0.95,
                    }}
                    transition={{ delay: i * 0.07 }}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium',
                      on
                        ? 'border-helix-signal/40 bg-helix-signal/15 text-helix-signal'
                        : 'border-helix-border/50 text-helix-muted',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {s.label}
                  </motion.span>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
