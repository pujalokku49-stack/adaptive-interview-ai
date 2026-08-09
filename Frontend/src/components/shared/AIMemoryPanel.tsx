import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Crosshair,
  MessageCircle,
  Gauge,
  Compass,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/types'
import { DifficultyBadge } from '@/components/ui/Badge'
import { ThinkingPulse } from './ThinkingPulse'

export interface MemorySignal {
  id: string
  label: string
  /** When this memory was last reinforced */
  updatedAt: number
  /** 'new' flash for recent writes */
  fresh?: boolean
}

export interface InterviewMemory {
  strengths: MemorySignal[]
  weaknesses: MemorySignal[]
  topicsCovered: MemorySignal[]
  conceptsMissed: MemorySignal[]
  communicationQuality: number
  difficulty: Difficulty
  nextFocus: string
  turnCount: number
  lastInsight: string
}

const BASELINE: InterviewMemory = {
  strengths: [
    {
      id: 's1',
      label: 'Clear four-stage pipeline framing',
      updatedAt: Date.now() - 120_000,
    },
    {
      id: 's2',
      label: 'Freshness vs latency tradeoff awareness',
      updatedAt: Date.now() - 90_000,
    },
  ],
  weaknesses: [
    {
      id: 'w1',
      label: 'Index ↔ re-ranker conflict under-specified',
      updatedAt: Date.now() - 60_000,
    },
  ],
  topicsCovered: [
    { id: 't1', label: 'Pipeline architecture', updatedAt: Date.now() - 180_000 },
    { id: 't2', label: 'CDC & dual-write', updatedAt: Date.now() - 100_000 },
    { id: 't3', label: 'Hybrid retrieval', updatedAt: Date.now() - 40_000 },
  ],
  conceptsMissed: [
    { id: 'c1', label: 'Conflict resolution protocol', updatedAt: Date.now() - 50_000 },
    { id: 'c2', label: 'Silent degradation detection', updatedAt: Date.now() - 30_000 },
  ],
  communicationQuality: 78,
  difficulty: 'hard',
  nextFocus: 'Probe disagreement between vector top-k and re-ranker',
  turnCount: 2,
  lastInsight: 'Candidate structures well; deepen production failure modes.',
}

const TURN_UPDATES: Array<(prev: InterviewMemory) => InterviewMemory> = [
  (prev) => ({
    ...prev,
    turnCount: prev.turnCount + 1,
    strengths: markFresh(upsert(prev.strengths, {
      id: 's3',
      label: 'Citation-first grounding habit',
      updatedAt: Date.now(),
      fresh: true,
    })),
    topicsCovered: markFresh(upsert(prev.topicsCovered, {
      id: 't4',
      label: 'Re-ranker disagreement',
      updatedAt: Date.now(),
      fresh: true,
    })),
    conceptsMissed: markFresh([
      ...prev.conceptsMissed.filter((c) => c.id !== 'c1'),
      {
        id: 'c3',
        label: 'Latency SLO when coverage drops',
        updatedAt: Date.now(),
        fresh: true,
      },
    ]),
    weaknesses: markFresh(upsert(prev.weaknesses, {
      id: 'w2',
      label: 'Operational runbooks not yet referenced',
      updatedAt: Date.now(),
      fresh: true,
    })),
    communicationQuality: Math.min(96, prev.communicationQuality + 4),
    difficulty: 'hard',
    nextFocus: 'Silent degradation when citation coverage slips',
    lastInsight: 'Remembered prior dual-write answer — pressing on observability gaps.',
  }),
  (prev) => ({
    ...prev,
    turnCount: prev.turnCount + 1,
    strengths: markFresh(upsert(prev.strengths, {
      id: 's4',
      label: 'Recovers calmly under tighter probes',
      updatedAt: Date.now(),
      fresh: true,
    })),
    topicsCovered: markFresh(upsert(prev.topicsCovered, {
      id: 't5',
      label: 'Observability & coverage',
      updatedAt: Date.now(),
      fresh: true,
    })),
    conceptsMissed: markFresh(
      prev.conceptsMissed
        .filter((c) => c.id !== 'c2')
        .concat({
          id: 'c4',
          label: 'Alerting thresholds for ranker drift',
          updatedAt: Date.now(),
          fresh: true,
        }),
    ),
    weaknesses: prev.weaknesses.map((w) =>
      w.id === 'w1' ? { ...w, label: 'Conflict protocol still shallow', fresh: true, updatedAt: Date.now() } : w,
    ),
    communicationQuality: Math.min(96, prev.communicationQuality + 3),
    difficulty: 'expert',
    nextFocus: 'Force a production incident narrative under time pressure',
    lastInsight: 'Memory retained pipeline framing — escalating difficulty to expert.',
  }),
  (prev) => ({
    ...prev,
    turnCount: prev.turnCount + 1,
    strengths: markFresh(upsert(prev.strengths, {
      id: 's5',
      label: 'Connects evals to shipping decisions',
      updatedAt: Date.now(),
      fresh: true,
    })),
    topicsCovered: markFresh(upsert(prev.topicsCovered, {
      id: 't6',
      label: 'Production incident response',
      updatedAt: Date.now(),
      fresh: true,
    })),
    conceptsMissed: markFresh(
      prev.conceptsMissed.filter((c) => c.id !== 'c3').concat({
        id: 'c5',
        label: 'Multi-region failover story',
        updatedAt: Date.now(),
        fresh: true,
      }),
    ),
    communicationQuality: Math.min(96, prev.communicationQuality + 2),
    difficulty: 'expert',
    nextFocus: 'Close the loop: guardrails + rollback criteria',
    lastInsight: 'Carrying all prior answers forward — synthesizing system ownership.',
  }),
]

function upsert(list: MemorySignal[], item: MemorySignal): MemorySignal[] {
  const idx = list.findIndex((x) => x.id === item.id)
  if (idx === -1) return [...list, item]
  const next = [...list]
  next[idx] = item
  return next
}

function markFresh(list: MemorySignal[]): MemorySignal[] {
  return list.map((item) => ({
    ...item,
    fresh: item.fresh ?? false,
  }))
}

export function useInterviewMemory() {
  const [memory, setMemory] = useState<InterviewMemory>(BASELINE)
  const [updating, setUpdating] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const turnRef = useRef(0)

  const clearFresh = useCallback(() => {
    setMemory((prev) => ({
      ...prev,
      strengths: prev.strengths.map((s) => ({ ...s, fresh: false })),
      weaknesses: prev.weaknesses.map((s) => ({ ...s, fresh: false })),
      topicsCovered: prev.topicsCovered.map((s) => ({ ...s, fresh: false })),
      conceptsMissed: prev.conceptsMissed.map((s) => ({ ...s, fresh: false })),
    }))
  }, [])

  /** Call when candidate sends an answer — memory begins consolidating */
  const beginMemoryWrite = useCallback(() => {
    setUpdating(true)
  }, [])

  /** Call when AI thinking completes — commit remembered signals */
  const commitMemoryTurn = useCallback(() => {
    const updater = TURN_UPDATES[Math.min(turnRef.current, TURN_UPDATES.length - 1)]
    turnRef.current += 1
    setMemory((prev) => updater(prev))
    setFlashKey((k) => k + 1)
    setUpdating(false)

    const t = window.setTimeout(() => clearFresh(), 3200)
    return () => window.clearTimeout(t)
  }, [clearFresh])

  return {
    memory,
    updating,
    flashKey,
    beginMemoryWrite,
    commitMemoryTurn,
  }
}

function StatusDot({
  tone = 'signal',
  pulse = false,
}: {
  tone?: 'signal' | 'success' | 'copper' | 'danger' | 'muted'
  pulse?: boolean
}) {
  const colors = {
    signal: 'bg-helix-signal',
    success: 'bg-helix-success',
    copper: 'bg-helix-copper',
    danger: 'bg-helix-danger',
    muted: 'bg-helix-muted',
  }
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-50',
            colors[tone],
          )}
        />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', colors[tone])} />
    </span>
  )
}

function MemoryChip({
  signal,
  tone = 'signal',
}: {
  signal: MemorySignal
  tone?: 'signal' | 'success' | 'copper' | 'danger'
}) {
  return (
    <motion.li
      layout
      initial={signal.fresh ? { opacity: 0, scale: 0.92, y: 6 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        'flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs leading-snug',
        tone === 'success' && 'border-helix-success/25 bg-helix-success/10 text-helix-text',
        tone === 'copper' && 'border-helix-copper/30 bg-helix-copper/10 text-helix-text',
        tone === 'danger' && 'border-helix-danger/25 bg-helix-danger/10 text-helix-text',
        tone === 'signal' && 'border-helix-signal/25 bg-helix-signal/10 text-helix-text',
        signal.fresh && 'ring-1 ring-helix-signal/40 shadow-[0_0_16px_-6px_rgb(62_224_197_/_0.5)]',
      )}
    >
      <StatusDot
        tone={tone === 'danger' ? 'danger' : tone === 'copper' ? 'copper' : tone === 'success' ? 'success' : 'signal'}
        pulse={!!signal.fresh}
      />
      <span className="min-w-0 flex-1">{signal.label}</span>
      {signal.fresh && (
        <span className="shrink-0 font-display text-[9px] font-semibold uppercase tracking-wider text-helix-signal">
          New
        </span>
      )}
    </motion.li>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string
  icon: typeof Brain
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-helix-muted">
          <Icon className="h-3.5 w-3.5" />
          <h4 className="font-display text-[11px] font-semibold uppercase tracking-[0.14em]">
            {title}
          </h4>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export function AIMemoryPanel({
  memory,
  updating,
  flashKey,
  className,
}: {
  memory: InterviewMemory
  updating: boolean
  flashKey: number
  className?: string
}) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-helix-copper/30 bg-helix-copper/15 text-helix-copper">
            <Brain className="h-4 w-4" />
            {(updating || memory.turnCount > 0) && (
              <span className="absolute -right-0.5 -top-0.5">
                <StatusDot tone="copper" pulse={updating} />
              </span>
            )}
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold">AI Memory</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] text-helix-muted">
              {updating ? 'Consolidating answers…' : `Retained · turn ${memory.turnCount}`}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'status-chip',
            updating
              ? 'border-helix-copper/35 bg-helix-copper/15 text-helix-copper'
              : 'border-helix-signal/25',
          )}
        >
          {updating ? 'Writing' : 'Synced'}
        </span>
      </div>

      {/* Live memory stream banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${flashKey}-${updating ? 'w' : 's'}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            'rounded-xl border px-3 py-2.5',
            updating
              ? 'border-helix-copper/35 bg-helix-copper/10'
              : 'border-helix-border/50 bg-helix-elevated/25',
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-helix-copper" />
            <p className="text-xs leading-relaxed text-helix-muted">
              {updating
                ? 'Cross-referencing this answer with earlier pipeline & freshness claims…'
                : memory.lastInsight}
            </p>
          </div>
          {updating && <ThinkingPulse className="mt-2.5" />}
        </motion.div>
      </AnimatePresence>

      <Section
        title="Candidate Strengths"
        icon={CheckCircle2}
        action={<StatusDot tone="success" pulse={memory.strengths.some((s) => s.fresh)} />}
      >
        <ul className="space-y-1.5">
          {memory.strengths.map((s) => (
            <MemoryChip key={s.id} signal={s} tone="success" />
          ))}
        </ul>
      </Section>

      <Section
        title="Detected Weaknesses"
        icon={AlertTriangle}
        action={<StatusDot tone="copper" pulse={memory.weaknesses.some((s) => s.fresh)} />}
      >
        <ul className="space-y-1.5">
          {memory.weaknesses.map((s) => (
            <MemoryChip key={s.id} signal={s} tone="copper" />
          ))}
        </ul>
      </Section>

      <Section title="Topics Already Covered" icon={Layers}>
        <div className="flex flex-wrap gap-1.5">
          {memory.topicsCovered.map((t) => (
            <motion.span
              key={t.id}
              layout
              initial={t.fresh ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border border-helix-border/60 bg-helix-elevated/40 px-2 py-1 text-[11px]',
                t.fresh && 'border-helix-signal/40 bg-helix-signal/10 text-helix-signal',
              )}
            >
              <StatusDot tone="signal" pulse={!!t.fresh} />
              {t.label}
            </motion.span>
          ))}
        </div>
      </Section>

      <Section title="Concepts Missed" icon={Crosshair}>
        <ul className="space-y-1.5">
          {memory.conceptsMissed.map((c) => (
            <MemoryChip key={c.id} signal={c} tone="danger" />
          ))}
        </ul>
      </Section>

      <Section title="Communication Quality" icon={MessageCircle}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-helix-muted">Clarity · structure · recovery</span>
            <motion.span
              key={memory.communicationQuality}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-semibold text-helix-signal"
            >
              {memory.communicationQuality}%
            </motion.span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-helix-elevated/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-helix-signal-dim to-helix-signal"
              animate={{ width: `${memory.communicationQuality}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-helix-muted">
            <StatusDot tone="signal" pulse={updating} />
            Continuously scored from retained answers
            <span className="ml-auto tabular-nums opacity-50">{tick % 2 === 0 ? '●' : '○'}</span>
          </div>
        </div>
      </Section>

      <Section title="Current Difficulty" icon={Gauge}>
        <div className="flex items-center justify-between rounded-xl border border-helix-border/50 bg-helix-elevated/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <StatusDot
              tone={memory.difficulty === 'expert' ? 'danger' : 'copper'}
              pulse={updating}
            />
            <span className="text-xs text-helix-muted">Adaptive bar</span>
          </div>
          <DifficultyBadge difficulty={memory.difficulty} />
        </div>
      </Section>

      <Section title="Next Interview Focus" icon={Compass}>
        <motion.div
          key={memory.nextFocus}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-helix-signal/25 bg-helix-signal/8 px-3 py-2.5"
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <StatusDot tone="signal" pulse />
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-helix-signal">
              Remembered trajectory
            </span>
          </div>
          <p className="text-xs leading-relaxed text-helix-text">{memory.nextFocus}</p>
        </motion.div>
      </Section>
    </div>
  )
}
