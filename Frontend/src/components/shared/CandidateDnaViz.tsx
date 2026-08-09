import { motion, AnimatePresence } from 'framer-motion'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { ProgressCircle, Counter } from '@/components/ui/ProgressCircle'
import { cn } from '@/lib/utils'
import type { DnaSkillNode, SkillDomain } from '@/types'
import { Activity, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'

const CATEGORY_COLOR: Record<DnaSkillNode['category'], string> = {
  technical: 'var(--color-helix-signal)',
  cognitive: 'var(--color-helix-copper)',
  signal: 'var(--color-helix-success)',
}

export function DnaSkillRadial({
  skill,
  pulsed = false,
  size = 88,
}: {
  skill: DnaSkillNode
  pulsed?: boolean
  size?: number
}) {
  const color = CATEGORY_COLOR[skill.category]
  const delta = skill.delta

  return (
    <motion.div
      layout
      animate={
        pulsed
          ? {
              boxShadow: [
                '0 0 0 0 transparent',
                `0 0 24px -4px color-mix(in oklab, ${color} 55%, transparent)`,
                '0 0 0 0 transparent',
              ],
            }
          : { boxShadow: '0 0 0 0 transparent' }
      }
      transition={{ duration: 1.4, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-2xl border border-helix-border/50 bg-helix-elevated/35 px-3 py-4',
        pulsed && 'border-helix-signal/40',
      )}
    >
      <ProgressCircle value={skill.value} size={size} strokeWidth={7} color={color} />
      <div className="text-center">
        <p className="font-display text-xs font-semibold leading-tight">{skill.label}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-helix-muted">
          {skill.category}
        </p>
      </div>
      <AnimatePresence>
        {delta !== undefined && delta !== 0 && pulsed && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
              delta > 0
                ? 'bg-helix-success/15 text-helix-success'
                : 'bg-helix-danger/15 text-helix-danger',
            )}
          >
            {delta > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta > 0 ? `+${delta}` : delta}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function DnaSkillGraph({
  radarData,
  className,
}: {
  radarData: { subject: string; score: number; fullMark: number }[]
  className?: string
}) {
  return (
    <div className={cn('h-80 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="rgb(36 56 64)" strokeOpacity={0.9} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'rgb(122 144 156)', fontSize: 11, fontFamily: 'Outfit' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'rgb(122 144 156)', fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="DNA"
            dataKey="score"
            stroke="#3EE0C5"
            fill="#3EE0C5"
            fillOpacity={0.22}
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
          />
          <Radar
            name="Trust ring"
            dataKey="fullMark"
            stroke="#E8A87C"
            fill="transparent"
            strokeWidth={1}
            strokeOpacity={0.35}
            strokeDasharray="4 4"
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Compact live strip for Interview Chamber sidebar */
export function LiveDnaStrip({
  skills,
  pulsedIds,
  readiness,
  lastFocus,
  turnCount,
}: {
  skills: DnaSkillNode[]
  pulsedIds: SkillDomain[]
  readiness: number
  lastFocus: string | null
  turnCount: number
}) {
  const highlight = skills
    .filter((s) => pulsedIds.includes(s.id))
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
    .slice(0, 4)

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-helix-copper" />
            <h3 className="font-display text-sm font-semibold">Live Candidate DNA</h3>
          </div>
          <p className="mt-1 text-xs text-helix-muted">
            {lastFocus ? `Focus · ${lastFocus}` : 'Genome syncing with chamber'}
          </p>
        </div>
        <div className="text-right">
          <Counter value={readiness} className="font-display text-xl font-bold text-helix-signal" />
          <p className="text-[10px] uppercase tracking-wider text-helix-muted">Readiness</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-helix-muted">
        <Activity className="h-3.5 w-3.5 text-helix-signal" />
        Turn {turnCount} · genome mutating on each answer
      </div>

      <div className="grid grid-cols-4 gap-2">
        {skills.slice(0, 8).map((s) => (
          <div
            key={s.id}
            className={cn(
              'rounded-lg border border-helix-border/50 bg-helix-bg/40 px-1.5 py-2 text-center transition-colors',
              pulsedIds.includes(s.id) && 'border-helix-signal/50 bg-helix-signal/10',
            )}
          >
            <ProgressCircle
              value={s.value}
              size={44}
              strokeWidth={4}
              color={CATEGORY_COLOR[s.category]}
            />
            <p className="mt-1 truncate text-[9px] font-medium text-helix-muted">{s.shortLabel}</p>
          </div>
        ))}
      </div>

      {highlight.length > 0 && (
        <ul className="space-y-1.5">
          {highlight.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-md bg-helix-elevated/50 px-2 py-1.5 text-xs"
            >
              <span>{s.label}</span>
              <span
                className={cn(
                  'font-display font-semibold',
                  (s.delta ?? 0) >= 0 ? 'text-helix-success' : 'text-helix-danger',
                )}
              >
                {(s.delta ?? 0) > 0 ? `+${s.delta}` : s.delta} → {s.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
