import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  ScanSearch,
  Gauge,
  MessageSquarePlus,
  Sparkles,
  Check,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AIAvatar } from './Avatars'
import { ThinkingPulse } from './ThinkingPulse'

export { ThinkingPulse } from './ThinkingPulse'

export type ThinkingStageId =
  | 'retrieving'
  | 'analyzing'
  | 'gaps'
  | 'difficulty'
  | 'generating'
  | 'ready'

export interface ThinkingStage {
  id: ThinkingStageId
  label: string
  detail: string
  icon: typeof BookOpen
  durationMs: number
}

export const THINKING_STAGES: ThinkingStage[] = [
  {
    id: 'retrieving',
    label: 'Retrieving Curriculum',
    detail: 'Pulling Day 19 hybrid retrieval drills and related nodes…',
    icon: BookOpen,
    durationMs: 900,
  },
  {
    id: 'analyzing',
    label: 'Analyzing Previous Response',
    detail: 'Scoring structure, tradeoffs, and recovery signals…',
    icon: Search,
    durationMs: 1100,
  },
  {
    id: 'gaps',
    label: 'Finding Knowledge Gaps',
    detail: 'Mapping weak edges in conflict resolution & observability…',
    icon: ScanSearch,
    durationMs: 1000,
  },
  {
    id: 'difficulty',
    label: 'Adjusting Difficulty',
    detail: 'Tightening probe depth based on live confidence…',
    icon: Gauge,
    durationMs: 850,
  },
  {
    id: 'generating',
    label: 'Generating Follow-up Question',
    detail: 'Composing the next adaptive probe…',
    icon: MessageSquarePlus,
    durationMs: 1200,
  },
  {
    id: 'ready',
    label: 'Ready',
    detail: 'Probe locked. Streaming into the chamber.',
    icon: Sparkles,
    durationMs: 500,
  },
]

export type StageStatus = 'pending' | 'active' | 'done'

export const THINKING_CYCLE_MS = THINKING_STAGES.reduce(
  (sum, s) => sum + s.durationMs,
  0,
)

export function useAIThinking(active: boolean) {
  const [stageIndex, setStageIndex] = useState(-1)
  const [cycleComplete, setCycleComplete] = useState(false)

  useEffect(() => {
    if (!active) {
      if (!cycleComplete) setStageIndex(-1)
      return
    }

    setCycleComplete(false)
    setStageIndex(0)

    const timers: number[] = []
    let elapsed = 0

    for (let i = 0; i < THINKING_STAGES.length - 1; i++) {
      elapsed += THINKING_STAGES[i].durationMs
      const next = i + 1
      timers.push(
        window.setTimeout(() => {
          setStageIndex(next)
          if (next === THINKING_STAGES.length - 1) {
            setCycleComplete(true)
          }
        }, elapsed),
      )
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active && cycleComplete) {
      // Hold Ready state briefly visible after response lands
      const t = window.setTimeout(() => {
        setStageIndex(-1)
        setCycleComplete(false)
      }, 2200)
      return () => window.clearTimeout(t)
    }
  }, [active, cycleComplete])

  const statuses: StageStatus[] = THINKING_STAGES.map((_, i) => {
    if (stageIndex < 0) return 'pending'
    if (i < stageIndex) return 'done'
    if (i === stageIndex) {
      return cycleComplete && i === THINKING_STAGES.length - 1 && !active
        ? 'done'
        : 'active'
    }
    return 'pending'
  })

  const current = stageIndex >= 0 ? THINKING_STAGES[stageIndex] : null
  const progress =
    stageIndex < 0
      ? 0
      : cycleComplete && !active
        ? 100
        : ((stageIndex + 0.45) / THINKING_STAGES.length) * 100

  return {
    stageIndex,
    current,
    statuses,
    progress: Math.min(100, Math.max(0, progress)),
    cycleComplete,
    stages: THINKING_STAGES,
    isThinking: active,
  }
}

function StageGlyph({
  status,
  icon: Icon,
}: {
  status: StageStatus
  icon: typeof BookOpen
}) {
  if (status === 'done') {
    return (
      <motion.span
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-helix-success/35 bg-helix-success/15 text-helix-success"
      >
        <Check className="h-3.5 w-3.5" />
      </motion.span>
    )
  }

  if (status === 'active') {
    return (
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-helix-signal/40 bg-helix-signal/15 text-helix-signal">
        <span className="absolute inset-0 animate-ping rounded-xl bg-helix-signal/15" />
        <Icon className="relative h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-helix-border/50 bg-helix-elevated/30 text-helix-muted">
      <Icon className="h-3.5 w-3.5 opacity-70" />
    </span>
  )
}

function OrbitIndicator() {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border border-dashed border-helix-signal/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-helix-signal"
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      />
    </span>
  )
}

export function AIThinkingPanel({
  className,
  thinkingState,
}: {
  className?: string
  thinkingState: ReturnType<typeof useAIThinking>
}) {
  const { current, statuses, progress, stages, cycleComplete, isThinking } = thinkingState

  const chipLabel = isThinking ? 'Thinking' : cycleComplete ? 'Ready' : 'Idle'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AIAvatar size="sm" thinking={isThinking && current?.id !== 'ready'} />
          <div>
            <h3 className="font-display text-sm font-semibold">AI Thinking</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] text-helix-muted">
              {isThinking ? 'Live cognition' : cycleComplete ? 'Cycle complete' : 'Standby'}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'status-chip',
            !isThinking &&
              !cycleComplete &&
              'border-helix-border/50 bg-helix-elevated/40 text-helix-muted',
            cycleComplete &&
              !isThinking &&
              'border-helix-success/30 bg-helix-success/10 text-helix-success',
          )}
        >
          {chipLabel}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-helix-muted">
          <span>Reasoning path</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-helix-elevated/80">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-helix-signal-dim via-helix-signal to-helix-copper"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          {isThinking && (
            <motion.div
              className="absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ left: ['-25%', '110%'] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id ?? 'idle'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28 }}
          className={cn(
            'rounded-xl border px-3 py-3',
            isThinking
              ? 'border-helix-signal/35 bg-helix-signal/8'
              : 'border-helix-border/50 bg-helix-elevated/25',
          )}
        >
          <p className="font-display text-xs font-semibold text-helix-signal">
            {current?.label ?? 'Awaiting candidate signal'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-helix-muted">
            {current?.detail ??
              'Send a response to activate adaptive reasoning across curriculum, gaps, and difficulty.'}
          </p>
          {isThinking && current && current.id !== 'ready' && (
            <ThinkingPulse className="mt-3" />
          )}
        </motion.div>
      </AnimatePresence>

      <ul className="space-y-2">
        {stages.map((stage, i) => {
          const status = statuses[i]
          return (
            <motion.li
              key={stage.id}
              layout
              animate={{
                opacity: status === 'pending' ? 0.42 : 1,
                x: status === 'active' ? 3 : 0,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={cn(
                'rounded-xl border px-2.5 py-2',
                status === 'active' &&
                  'border-helix-signal/40 bg-helix-signal/5 shadow-[0_0_24px_-10px_rgb(62_224_197_/_0.5)]',
                status === 'done' && 'border-helix-border/50 bg-helix-elevated/20',
                status === 'pending' && 'border-helix-border/30',
              )}
            >
              <div className="flex items-center gap-2.5">
                <StageGlyph status={status} icon={stage.icon} />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate font-display text-xs font-semibold',
                      status === 'active' && 'text-helix-signal',
                      status === 'done' && 'text-helix-text',
                      status === 'pending' && 'text-helix-muted',
                    )}
                  >
                    {stage.label}
                  </p>
                  <AnimatePresence>
                    {status === 'active' && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-0.5 overflow-hidden text-[11px] leading-snug text-helix-muted"
                      >
                        {stage.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                {status === 'active' && <OrbitIndicator />}
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

/** Compact in-chat status — replaces three-dot typing indicator */
export function AIThinkingChatStatus({ stageLabel }: { stageLabel?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-start gap-3"
    >
      <AIAvatar size="sm" thinking />
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-helix-signal/30 bg-helix-signal/8 px-4 py-3">
        <p className="font-display text-xs font-semibold text-helix-signal">
          Helix is thinking
        </p>
        <p className="mt-1 text-xs text-helix-muted">
          {stageLabel ?? 'Reasoning through the next probe…'}
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <ThinkingPulse />
          <span className="text-[10px] uppercase tracking-wider text-helix-muted">
            Live panel →
          </span>
        </div>
      </div>
    </motion.div>
  )
}
