import { motion } from 'framer-motion'
import {
  MissionFrame,
  IdentityBar,
  PageTransition,
} from '@/components/layout/PageTransition'
import { CandidateIdentity } from '@/components/shared/Cards'
import { ProgressCircle } from '@/components/ui/ProgressCircle'
import { DnaSkillGraph } from '@/components/shared/CandidateDnaViz'
import { useCandidateDna } from '@/context/CandidateDnaContext'
import { candidateDna } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { Activity, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageStateGate } from '@/components/states'
import { usePageState } from '@/hooks/usePageState'
import type { DnaSkillNode } from '@/types'

import { useUser } from '@/context/UserContext'

const CATEGORY_META = {
  technical: { label: 'Technical', accent: 'text-helix-signal' },
  cognitive: { label: 'Cognitive', accent: 'text-helix-copper' },
  signal: { label: 'Signals', accent: 'text-helix-success' },
} as const

/** Live genome mutates during Interview Chamber */
export function DnaPage() {
  const { profile } = useUser()
  const { state, retry } = usePageState({ loadMs: 680 })
  const {
    candidate,
    learningSignals: staticSignals,
    achievements,
  } = candidateDna
  const {
    skillNodes,
    radarData,
    readiness,
    turnCount,
    lastFocus,
    pulsedIds,
    history,
    lastDeltas,
    resetDna,
  } = useCandidateDna()

  const byCategory = (
    ['technical', 'cognitive', 'signal'] as const
  ).map((cat) => ({
    cat,
    ...CATEGORY_META[cat],
    skills: skillNodes.filter((s) => s.category === cat),
  }))

  const liveSignals = [
    {
      label: 'Learning Signals',
      trend: lastDeltas.learning_signals ?? staticSignals[0]?.trend ?? 0,
      note: lastFocus
        ? `Reinforcing under “${lastFocus}”`
        : (staticSignals[0]?.note ?? 'Absorbing chamber feedback'),
      value: skillNodes.find((s) => s.id === 'learning_signals')?.value ?? 64,
    },
    {
      label: 'Adaptability',
      trend: lastDeltas.adaptability ?? 8,
      note: 'Course-correction after tighter probes',
      value: skillNodes.find((s) => s.id === 'adaptability')?.value ?? 70,
    },
    {
      label: 'Confidence',
      trend: lastDeltas.confidence ?? 2,
      note: 'Certainty calibrated to answer depth',
      value: skillNodes.find((s) => s.id === 'confidence')?.value ?? 81,
    },
    {
      label: 'Communication',
      trend: lastDeltas.communication ?? 12,
      note: 'Structure, clarity, citation discipline',
      value: skillNodes.find((s) => s.id === 'communication')?.value ?? 78,
    },
  ]

  return (
    <PageStateGate state={state} kind="dna" onRetry={retry}>
      <PageTransition>
        <MissionFrame>
          <IdentityBar
            label="Candidate DNA"
            title="Living skill genome"
            meta={
              lastFocus
                ? `Turn ${turnCount} · last focus “${lastFocus}”`
                : `Turn ${turnCount} · twelve domains mutate after every answer`
            }
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={resetDna} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                <Link to="/interview">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Evolve in chamber
                  </Button>
                </Link>
              </>
            }
          />

          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div className="space-y-6">
              <CandidateIdentity
                candidate={{ ...candidate, name: profile.name, role: profile.role, readiness }}
                readiness={readiness}
              />
              <div className="flex items-center gap-5 rounded-2xl border border-helix-border/50 bg-helix-surface/25 p-5">
                <ProgressCircle
                  value={readiness}
                  size={96}
                  color="var(--color-helix-copper)"
                  label="Ready"
                />
                <div>
                  <p className="font-display text-sm font-semibold">Composite readiness</p>
                  <p className="mt-1 text-xs leading-relaxed text-helix-muted">
                    Weighted across all twelve DNA axes. Updates live when the chamber writes
                    mutations.
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-helix-signal">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-helix-signal opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-helix-signal" />
                    </span>
                    Live genome
                  </p>
                </div>
              </div>

              <div>
                <h2 className="mb-3 font-display text-sm font-semibold">Mutation log</h2>
                <ul className="max-h-40 space-y-1.5 overflow-y-auto border-l border-helix-border/50 pl-3">
                  {[...history].reverse().map((h) => (
                    <li
                      key={`${h.turn}-${h.at}`}
                      className="flex items-start gap-2 py-1 text-xs"
                    >
                      <span className="font-display font-semibold text-helix-signal">
                        T{h.turn}
                      </span>
                      <span className="text-helix-muted">{h.focus}</span>
                    </li>
                  ))}
                  {history.length === 0 && (
                    <li className="py-1 text-xs text-helix-muted">
                      No mutations yet — open the chamber.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-helix-border/50 bg-helix-surface/20 p-2 sm:p-4">
              <p className="mb-2 px-2 font-display text-xs font-semibold uppercase tracking-wide text-helix-muted">
                Skill radar
              </p>
              <DnaSkillGraph radarData={radarData} />
            </div>
          </div>

          <section className="space-y-8">
            <div>
              <h2 className="font-display text-lg font-semibold">Domain scores</h2>
              <p className="mt-1 text-sm text-helix-muted">
                Bars shift when chamber answers land — pulsed domains highlight the latest write.
              </p>
            </div>
            {byCategory.map(({ cat, label, accent, skills }) => (
              <div key={cat}>
                <p
                  className={cn(
                    'mb-3 text-[11px] font-semibold uppercase tracking-wider',
                    accent,
                  )}
                >
                  {label}
                </p>
                <div className="space-y-3">
                  {skills.map((s) => (
                    <DomainBar
                      key={s.id}
                      skill={s}
                      delta={lastDeltas[s.id]}
                      pulsed={pulsedIds.includes(s.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg font-semibold">Learning signals</h2>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-helix-border/50 bg-helix-border/40 sm:grid-cols-2 lg:grid-cols-4">
              {liveSignals.map((s) => (
                <div
                  key={s.label}
                  className="bg-helix-surface/40 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold">{s.label}</p>
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-semibold',
                        s.trend >= 0 ? 'text-helix-success' : 'text-helix-danger',
                      )}
                    >
                      {s.trend >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {s.trend > 0 ? `+${s.trend}` : s.trend}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold tabular-nums text-helix-text">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-helix-muted">{s.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg font-semibold">Achievements</h2>
            <div className="flex flex-wrap gap-3">
              {achievements.map((a) => (
                <motion.div
                  key={a.id}
                  whileHover={{ y: -2 }}
                  className="min-w-[160px] flex-1 rounded-xl border border-helix-copper/25 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-helix-copper)_12%,transparent),transparent_70%)] px-4 py-4 sm:max-w-[220px]"
                >
                  <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-helix-copper">
                    Stamp
                  </p>
                  <p className="mt-1.5 font-display text-sm font-semibold">{a.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-helix-muted">
                    {a.description}
                  </p>
                  {a.earnedAt && (
                    <p className="mt-3 text-[11px] text-helix-signal">Earned {a.earnedAt}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </MissionFrame>
      </PageTransition>
    </PageStateGate>
  )
}

function DomainBar({
  skill,
  delta,
  pulsed,
}: {
  skill: DnaSkillNode
  delta?: number
  pulsed?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-2.5 transition-colors',
        pulsed && 'bg-helix-signal/8 ring-1 ring-helix-signal/25',
      )}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-display text-sm font-medium">{skill.label}</span>
        <span className="flex items-center gap-2 text-xs tabular-nums">
          {delta !== undefined && delta !== 0 && (
            <span
              className={cn(
                'font-semibold',
                delta > 0 ? 'text-helix-success' : 'text-helix-danger',
              )}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          <span className="font-display font-semibold text-helix-text">{skill.value}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-helix-elevated">
        <motion.div
          className="h-full rounded-full bg-helix-signal"
          initial={false}
          animate={{ width: `${skill.value}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
