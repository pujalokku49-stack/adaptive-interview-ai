import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ProgressCircle, Counter } from '@/components/ui/ProgressCircle'
import { DifficultyBadge, TopicBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { KnowledgePassport } from '@/types'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Compass,
  Gauge,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function PassportStamp({ code }: { code: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -6 }}
      transition={{ delay: 0.35, type: 'spring', stiffness: 160, damping: 14 }}
      className="pointer-events-none absolute -right-2 top-6 select-none md:right-6 md:top-8"
      aria-hidden
    >
      <div className="rounded-full border-2 border-helix-copper/55 px-4 py-3 text-center shadow-[0_0_32px_-8px_rgb(232_168_124_/_0.45)]">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-helix-copper">
          Verified
        </p>
        <p className="mt-0.5 font-display text-xs font-semibold text-helix-copper/90">{code}</p>
      </div>
    </motion.div>
  )
}

function ScorePill({
  label,
  value,
  accent = 'signal',
}: {
  label: string
  value: number
  accent?: 'signal' | 'copper'
}) {
  return (
    <div className="flex items-center gap-3">
      <ProgressCircle
        value={value}
        size={72}
        strokeWidth={6}
        color={
          accent === 'copper' ? 'var(--color-helix-copper)' : 'var(--color-helix-signal)'
        }
      />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-helix-muted">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">
          <Counter value={value} />
          <span className="ml-0.5 text-sm font-medium text-helix-muted">/100</span>
        </p>
      </div>
    </div>
  )
}

function TopicScoreList({
  items,
  variant,
}: {
  items: { name: string; score: number }[]
  variant: 'strong' | 'weak'
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((t, i) => (
        <motion.li
          key={t.name}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{t.name}</span>
              <span
                className={cn(
                  'font-display text-sm font-bold',
                  variant === 'strong' ? 'text-helix-success' : 'text-helix-copper',
                )}
              >
                {t.score}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-helix-elevated">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${t.score}%` }}
                transition={{ duration: 0.9, delay: 0.1 * i, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  variant === 'strong'
                    ? 'bg-gradient-to-r from-helix-success/80 to-helix-signal'
                    : 'bg-gradient-to-r from-helix-copper-dim to-helix-copper',
                )}
              />
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  )
}

export function KnowledgePassportCard({ passport }: { passport: KnowledgePassport }) {
  const confDelta =
    passport.confidenceTrend[passport.confidenceTrend.length - 1].value -
    passport.confidenceTrend[0].value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        elevation="float"
        padding="none"
        glow
        className="relative overflow-hidden border-helix-copper/20"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--color-helix-signal)_14%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--color-helix-copper)_16%,transparent),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-helix-copper/50 to-transparent" />

        <div className="relative border-b border-helix-border/60 px-5 py-5 md:px-8 md:py-6">
          <PassportStamp code={passport.stamp} />
          <div className="flex flex-wrap items-start gap-3 pr-24">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-helix-signal/30 bg-helix-signal/10 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-helix-signal">
              <Award className="h-3.5 w-3.5" />
              Knowledge Passport
            </span>
            <TopicBadge topic={`Issued ${passport.issuedAt}`} />
          </div>
          <h2 className="mt-4 max-w-xl font-display text-2xl font-bold tracking-tight md:text-3xl">
            {passport.candidateName}
          </h2>
          <p className="mt-1 text-sm text-helix-muted">
            {passport.role} · {passport.sessionTitle}
          </p>
        </div>

        <div className="relative grid gap-6 p-5 md:grid-cols-2 md:p-8 lg:grid-cols-12 lg:gap-8">
          {/* Overall + Technical Communication */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-5 rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-5 lg:col-span-4"
          >
            <div className="flex items-center gap-2 text-helix-muted">
              <Gauge className="h-4 w-4 text-helix-signal" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Core scores
              </span>
            </div>
            <ScorePill label="Overall Interview Score" value={passport.overallScore} />
            <div className="h-px bg-helix-border/60" />
            <ScorePill
              label="Technical Communication"
              value={passport.technicalCommunication}
              accent="copper"
            />
            <div className="flex items-start gap-2 rounded-xl bg-helix-elevated/40 px-3 py-2.5 text-xs text-helix-muted">
              <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-helix-copper" />
              Structure, clarity, and citation discipline under adaptive probes.
            </div>
          </motion.div>

          {/* Strongest / Weakest */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:col-span-4"
          >
            <div className="rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-helix-success" />
                <h3 className="font-display text-sm font-semibold">Strongest Topics</h3>
              </div>
              <TopicScoreList items={passport.strongestTopics} variant="strong" />
            </div>
            <div className="rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-helix-copper" />
                <h3 className="font-display text-sm font-semibold">Weakest Topics</h3>
              </div>
              <TopicScoreList items={passport.weakestTopics} variant="weak" />
            </div>
          </motion.div>

          {/* Confidence trend */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-4 lg:col-span-4"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-helix-signal" />
                <h3 className="font-display text-sm font-semibold">Confidence Trend</h3>
              </div>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 font-display text-xs font-bold',
                  confDelta >= 0
                    ? 'bg-helix-success/15 text-helix-success'
                    : 'bg-helix-danger/15 text-helix-danger',
                )}
              >
                {confDelta >= 0 ? `+${confDelta}` : confDelta} pts
              </span>
            </div>
            <p className="mb-3 text-xs text-helix-muted">Live recovery across the chamber arc</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={passport.confidenceTrend}>
                  <defs>
                    <linearGradient id="confFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3EE0C5" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3EE0C5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'rgb(122 144 156)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[50, 100]} hide />
                  <Tooltip
                    contentStyle={{
                      background: '#152229',
                      border: '1px solid #243840',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3EE0C5"
                    strokeWidth={2.5}
                    fill="url(#confFill)"
                    animationDuration={1100}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Difficulty progression */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-5 lg:col-span-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-4 w-4 text-helix-copper" />
              <h3 className="font-display text-sm font-semibold">
                Interview Difficulty Progression
              </h3>
            </div>
            <ol className="relative space-y-0">
              {passport.difficultyProgression.map((step, i) => (
                <li key={step.stage} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < passport.difficultyProgression.length - 1 && (
                    <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-helix-border" />
                  )}
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15 * i, type: 'spring', stiffness: 220 }}
                    className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-helix-signal/40 bg-helix-elevated font-display text-[10px] font-bold text-helix-signal"
                  >
                    {i + 1}
                  </motion.span>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 pt-0.5">
                    <span className="text-sm font-medium">{step.stage}</span>
                    <DifficultyBadge difficulty={step.difficulty} />
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Next mission */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative overflow-hidden rounded-2xl border border-helix-copper/35 bg-gradient-to-br from-helix-copper/15 via-helix-bg/40 to-helix-signal/10 p-5 lg:col-span-7"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-helix-copper/20 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-lg">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-helix-copper">
                  Recommended Next Learning Mission
                </p>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">
                  {passport.nextMission.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-helix-muted">
                  {passport.nextMission.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TopicBadge topic={`Day ${passport.nextMission.day}`} />
                  <TopicBadge topic={passport.nextMission.eta} />
                </div>
              </div>
              <Link to="/curriculum">
                <Button variant="copper" className="shrink-0">
                  Start mission <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Mastered / Revision */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-5 lg:col-span-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-helix-success" />
              <h3 className="font-display text-sm font-semibold">Topics Mastered</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {passport.topicsMastered.map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="inline-flex items-center rounded-lg border border-helix-success/30 bg-helix-success/10 px-2.5 py-1 text-xs font-medium text-helix-success"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-helix-border/60 bg-helix-bg/35 p-5 lg:col-span-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-helix-copper" />
              <h3 className="font-display text-sm font-semibold">Topics Requiring Revision</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {passport.topicsRevision.map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="inline-flex items-center rounded-lg border border-helix-copper/35 bg-helix-copper/10 px-2.5 py-1 text-xs font-medium text-helix-copper"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
