import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Flame,
  Target,
  Trophy,
  Calendar,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import {
  MissionFrame,
  MissionSection,
  PageTransition,
} from '@/components/layout/PageTransition'
import { ProgressCircle, Counter } from '@/components/ui/ProgressCircle'
import { InterviewSessionRow } from '@/components/shared/Cards'
import { Button } from '@/components/ui/Button'
import { DifficultyBadge, TopicBadge } from '@/components/ui/Badge'
import { dashboardData as mockDashboardData, curriculumDays } from '@/data/mock'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PageStateGate } from '@/components/states'
import { usePageState } from '@/hooks/usePageState'
import { springs } from '@/lib/motion'
import { fetchCandidates } from '@/services/interviewApi'
import { useUser } from '@/context/UserContext'

/** DashboardPage — wired to candidates API for live readiness */
export function DashboardPage() {
  const { profile } = useUser()
  const [data, setData] = useState(mockDashboardData)
  const { state, retry } = usePageState({ loadMs: 650 })
  const nextDay = curriculumDays.find((d) => !d.completed)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const candidates = await fetchCandidates()
        if (cancelled) return
        if (candidates.length > 0) {
          const first = candidates[0]
          const computedReadiness = first.signals
            ? Math.min(99, Math.round(50 + (first.signals.missionsCompleted / 31) * 50))
            : data.readiness;
          setData((prev) => ({
            ...prev,
            readiness: computedReadiness,
            missionProgress: first.signals
              ? Math.round((first.signals.missionsCompleted / 31) * 100)
              : prev.missionProgress,
            analytics: [
              { label: 'Avg Score', value: computedReadiness },
              { label: 'Sessions', value: first.signals?.missionsCompleted ?? 18 },
              { label: 'Streak', value: first.signals?.commitDays ?? 6 },
              { label: 'Topics', value: 12 },
            ],
          }))
        }
      } catch (err) {
        console.error('Failed to load dashboard data from backend', err)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [retry])


  return (
    <PageStateGate state={state} kind="dashboard" onRetry={retry}>
      <PageTransition>
        <MissionFrame className="min-h-[calc(100vh-4.25rem)]">
          {/* Readiness hero — one composition */}
          <MissionSection>
            <div className="relative overflow-hidden rounded-3xl border border-helix-border/70 bg-helix-surface/40">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-helix-copper)_14%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklab,var(--color-helix-signal)_10%,transparent),transparent_50%)]" />
              <div className="relative grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-8 lg:grid-cols-[auto_1.2fr_0.9fr] lg:items-center">
                <ProgressCircle
                  value={data.readiness}
                  size={148}
                  strokeWidth={11}
                  color="var(--color-helix-copper)"
                  label="Ready"
                />

                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold tracking-wide text-helix-copper">
                    Mission Control
                  </p>
                  <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
                    {profile.name} · {data.readiness}% ready
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-helix-muted">
                    Curriculum day {data.missionProgress}% complete. Next chamber calibrated to
                    your live DNA and hiring bar.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/interview">
                      <Button variant="copper">
                        Enter chamber <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    {nextDay && (
                      <Link to="/curriculum">
                        <Button variant="secondary">
                          <BookOpen className="h-4 w-4" /> Resume Day {nextDay.day}
                        </Button>
                      </Link>
                    )}
                    <Link
                      to="/debrief"
                      className="inline-flex items-center px-2 text-sm font-medium text-helix-signal hover:underline"
                    >
                      Last passport
                    </Link>
                  </div>
                </div>

                {data.upcoming && (
                  <div className="rounded-2xl border border-helix-border/60 bg-helix-bg/40 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-helix-muted">
                      Upcoming chamber
                    </p>
                    <h2 className="mt-2 font-display text-lg font-semibold leading-snug">
                      {data.upcoming.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <DifficultyBadge difficulty={data.upcoming.difficulty} />
                      <TopicBadge topic={data.upcoming.topic} />
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-xs text-helix-muted">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {new Date(data.upcoming.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </MissionSection>

          {/* Metric strip — no cards */}
          <MissionSection>
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-helix-border/60 bg-helix-border/40 sm:grid-cols-4">
              {[
                { label: 'Avg score', value: data.analytics[0].value, icon: Target, trend: '+4 wk' },
                { label: 'Sessions', value: data.analytics[1].value, icon: Activity },
                { label: 'Streak', value: data.analytics[2].value, suffix: 'd', icon: Flame, trend: 'Active' },
                { label: 'Topics', value: data.analytics[3].value, icon: Trophy },
              ].map((m) => (
                <li
                  key={m.label}
                  className="flex items-center gap-3 bg-helix-surface/80 px-4 py-4"
                >
                  <m.icon className="h-4 w-4 text-helix-signal" aria-hidden />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-helix-muted">
                      {m.label}
                    </p>
                    <p className="font-display text-xl font-bold tabular-nums">
                      <Counter value={m.value} suffix={m.suffix ?? ''} />
                    </p>
                    {m.trend && (
                      <p className="text-[11px] text-helix-success">{m.trend}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </MissionSection>

          <MissionSection className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">Today’s learning</h2>
                  <p className="text-sm text-helix-muted">Queued drills — start the top one</p>
                </div>
                <Link to="/curriculum" className="text-sm font-medium text-helix-signal hover:underline">
                  Full track
                </Link>
              </div>
              <ul className="space-y-1">
                {data.todayLearning.map((item, i) => (
                  <li
                    key={item.title}
                    className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-helix-elevated/40"
                  >
                    <span className="font-display text-sm font-bold text-helix-muted/50 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="font-medium">{item.title}</span>
                        <span className="shrink-0 text-helix-muted">{item.eta}</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-helix-elevated">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={springs.soft}
                          className="h-full rounded-full bg-helix-signal"
                        />
                      </div>
                    </div>
                    {i === 0 && (
                      <Link to="/interview">
                        <Button size="sm" variant="ghost">
                          Start
                        </Button>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-1 font-display text-lg font-semibold">Practice intensity</h2>
              <p className="mb-4 text-sm text-helix-muted">Sessions this week</p>
              <div className="flex items-end gap-2">
                {data.heatmap.map((d, i) => (
                  <motion.div
                    key={d.day}
                    className="flex flex-1 flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <div
                      className={cn(
                        'w-full rounded-lg transition-colors',
                        d.value === 0 && 'bg-helix-elevated/60',
                        d.value === 1 && 'bg-helix-signal/25',
                        d.value === 2 && 'bg-helix-signal/40',
                        d.value === 3 && 'bg-helix-signal/55',
                        d.value === 4 && 'bg-helix-signal/75',
                        d.value >= 5 && 'bg-helix-signal',
                      )}
                      style={{ height: `${28 + d.value * 14}px` }}
                      title={`${d.value} sessions`}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-wide text-helix-muted">
                      {d.day}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </MissionSection>

          <MissionSection className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold">Recent chambers</h2>
              <ul className="divide-y divide-helix-border/50 rounded-2xl border border-helix-border/60 overflow-hidden">
                {data.recentInterviews.map((s) => (
                  <InterviewSessionRow key={s.id} session={s} />
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold">Stamps earned</h2>
              <ul className="flex flex-wrap gap-3">
                {data.achievements.map((a) => (
                  <li
                    key={a.id}
                    className="flex min-w-[140px] flex-1 flex-col items-center rounded-full border-2 border-helix-copper/40 px-4 py-5 text-center"
                  >
                    <p className="font-display text-sm font-bold text-helix-copper">{a.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-helix-muted">{a.description}</p>
                    {a.earnedAt && (
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-helix-muted/80">
                        {a.earnedAt}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </MissionSection>
        </MissionFrame>
      </PageTransition>
    </PageStateGate>
  )
}
