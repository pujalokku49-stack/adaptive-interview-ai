import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition, MissionFrame } from '@/components/layout/PageTransition'
import { Search } from '@/components/ui/Search'
import { DifficultyBadge, TopicBadge } from '@/components/ui/Badge'
import { ProgressCircle } from '@/components/ui/ProgressCircle'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { curriculumDays as mockCurriculumDays } from '@/data/mock'
import type { Difficulty, CurriculumDay } from '@/types'
import { cn } from '@/lib/utils'
import { EmptyState, PageStateGate } from '@/components/states'
import { usePageState } from '@/hooks/usePageState'
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { fetchCurriculum } from '@/services/interviewApi'

/** CurriculumPage — wired to real curriculum API */
export function CurriculumPage() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [curriculumDays, setCurriculumDays] = useState<CurriculumDay[]>(mockCurriculumDays)
  const completed = curriculumDays.filter((d) => d.completed).length
  const { state, retry } = usePageState({ loadMs: 400 })
  const nextOpen = curriculumDays.find((d) => !d.completed)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const days = await fetchCurriculum()
        if (cancelled) return
        setCurriculumDays(days)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to fetch curriculum from backend, falling back to mocks', err)
        // Non-fatal fallback to mocks, so we don't setFailed(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [retry])


  const filtered = useMemo(() => {
    return curriculumDays.filter((d) => {
      const matchQ =
        !query ||
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        d.topics.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      const matchD = difficulty === 'all' || d.difficulty === difficulty
      return matchQ && matchD
    })
  }, [query, difficulty])

  const clearFilters = () => {
    setQuery('')
    setDifficulty('all')
  }

  return (
    <PageStateGate
      state={state}
      kind="curriculum"
      onRetry={retry}
      onEmptyAction={clearFilters}
    >
      <PageTransition>
        <MissionFrame>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-xs font-semibold tracking-wide text-helix-signal">
                Adaptive track
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
                31-day curriculum
              </h1>
              <p className="mt-2 text-sm text-helix-muted">
                {completed} days complete
                {nextOpen ? ` · next up Day ${nextOpen.day}: ${nextOpen.title}` : ' · track finished'}
              </p>
            </div>
            <ProgressCircle
              value={(completed / 31) * 100}
              size={96}
              label={`${completed}/31`}
            />
          </div>

          {/* Day progress ribbon */}
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-1">
              {curriculumDays.map((d) => (
                <div
                  key={d.day}
                  title={d.title}
                  className={cn(
                    'h-2 w-3 rounded-sm sm:w-4',
                    d.completed ? 'bg-helix-success' : 'bg-helix-elevated',
                    nextOpen?.day === d.day && 'ring-2 ring-helix-copper ring-offset-1 ring-offset-helix-bg',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Search
              id="curriculum-search"
              placeholder="Search days or topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:max-w-sm"
              aria-label="Search curriculum"
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty filter">
              {(['all', 'easy', 'medium', 'hard', 'expert'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  aria-pressed={difficulty === d}
                  className={cn(
                    'focus-ring rounded-lg border px-3 py-2 font-display text-xs font-semibold capitalize transition-colors',
                    difficulty === d
                      ? 'border-helix-signal bg-helix-signal/10 text-helix-signal'
                      : 'border-helix-border/70 text-helix-muted hover:border-helix-border hover:text-helix-text',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No days match"
              description="Try a broader search or clear the difficulty filter to reveal the adaptive track."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <Accordion
              allowMultiple
              items={filtered.map((d) => ({
                id: `day-${d.day}`,
                title: `Day ${d.day} — ${d.title}`,
                content: (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed">{d.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <DifficultyBadge difficulty={d.difficulty} />
                      {d.topics.map((t) => (
                        <TopicBadge key={t} topic={t} />
                      ))}
                      <span className="inline-flex items-center gap-1 text-xs text-helix-muted">
                        <Clock className="h-3 w-3" aria-hidden />
                        {d.durationMin} min
                      </span>
                      {d.completed && (
                        <span className="inline-flex items-center gap-1 text-xs text-helix-success">
                          <CheckCircle2 className="h-3 w-3" aria-hidden />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl border border-helix-border/60 bg-helix-bg/40 p-4">
                      <p className="font-display text-sm font-semibold">
                        Drill · {d.topics[0]} focus
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-helix-muted">
                        {d.topics.map((t) => (
                          <li key={t} className="flex gap-2">
                            <span className="text-helix-signal">·</span>
                            Demonstrate fluency in {t.toLowerCase()} under adaptive probes
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link to="/interview">
                          <Button size="sm" variant={d.completed ? 'secondary' : 'copper'}>
                            {d.completed ? 'Replay in chamber' : 'Start drill'}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <span className="text-xs text-helix-muted">
                          Opens Interview Chamber with this day’s focus
                        </span>
                      </div>
                    </div>
                  </div>
                ),
              }))}
            />
          )}
        </MissionFrame>
      </PageTransition>
    </PageStateGate>
  )
}
