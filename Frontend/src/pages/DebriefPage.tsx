import { motion } from 'framer-motion'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import {
  MissionFrame,
  IdentityBar,
  PageTransition,
} from '@/components/layout/PageTransition'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { FeedbackCard } from '@/components/shared/Cards'
import { StrengthMeter } from '@/components/shared/ConfidenceMeter'
import { Timeline } from '@/components/shared/Timeline'
import { KnowledgePassportCard } from '@/components/shared/KnowledgePassport'
import { Button } from '@/components/ui/Button'
import { Download, RotateCcw, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '@/context/ToastContext'
import { PageStateGate } from '@/components/states'
import { usePageState } from '@/hooks/usePageState'

import { useInterview } from '@/context/InterviewContext'
import { useUser } from '@/context/UserContext'
import { fetchFinalFeedback, fetchSession, adaptToDebriefResult } from '@/services/interviewApi'
import { debriefResult as mockDebriefResult } from '@/data/mock'
import { useEffect, useState } from 'react'

/** DebriefPage — loads final feedback from backend or fallback mock */
export function DebriefPage() {
  const { session, finalFeedback, setFinalFeedback, setSession } = useInterview()
  const { profile } = useUser()
  const { toast } = useToast()
  const { state, retry } = usePageState({ loadMs: 700 })
  const [debriefData, setDebriefData] = useState(mockDebriefResult)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!session) {
        setDebriefData({
          ...mockDebriefResult,
          passport: {
            ...mockDebriefResult.passport,
            candidateName: profile.name,
            role: profile.role,
          },
        })
        return
      }

      try {
        const freshSession = await fetchSession(session.sessionId)
        if (cancelled) return
        setSession(freshSession)

        if (freshSession.status === 'completed') {
          let report = finalFeedback
          if (!report) {
            report = await fetchFinalFeedback(session.sessionId)
            if (cancelled) return
            setFinalFeedback(report)
          }

          const adapted = adaptToDebriefResult(
            session.sessionId,
            freshSession,
            report,
            profile.name,
            profile.role,
          )
          setDebriefData(adapted)
        } else {
          setDebriefData({
            ...mockDebriefResult,
            passport: {
              ...mockDebriefResult.passport,
              candidateName: profile.name,
              role: profile.role,
            },
          })
        }
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load debrief data from backend', err)
        setDebriefData(mockDebriefResult)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [session, retry])

  const data = debriefData


  return (
    <PageStateGate state={state} kind="debrief" onRetry={retry}>
      <PageTransition>
        <MissionFrame>
          <IdentityBar
            label="Knowledge Passport"
            title="Session credential"
            meta={`${data.passport.sessionTitle} · issued ${data.passport.issuedAt}`}
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: 'Exporting PDF',
                      description: 'Passport snapshot ready for download.',
                      variant: 'info',
                    })
                  }
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Link to="/interview">
                  <Button variant="copper" size="sm">
                    <RotateCcw className="h-4 w-4" /> Retry chamber
                  </Button>
                </Link>
              </>
            }
          />

          <KnowledgePassportCard passport={data.passport} />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 font-display text-lg font-semibold">Deep dive</h2>
            <Tabs defaultValue="competency">
              <TabsList>
                <TabsTrigger value="competency">Competency</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="paths">Next paths</TabsTrigger>
              </TabsList>

              <TabsContent value="competency">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="h-72 rounded-2xl border border-helix-border/50 bg-helix-surface/30 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data.radar}>
                        <PolarGrid stroke="rgb(36 53 62)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: 'rgb(148 168 180)', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#3EE0C5"
                          fill="#3EE0C5"
                          fillOpacity={0.22}
                          animationDuration={900}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-helix-success">
                        Strengths
                      </p>
                      <div className="space-y-3">
                        {data.strengths.map((s, i) => (
                          <StrengthMeter
                            key={s}
                            label={s}
                            value={92 - i * 6}
                            variant="strength"
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-helix-copper">
                        Gaps
                      </p>
                      <div className="space-y-3">
                        {data.weaknesses.map((w, i) => (
                          <StrengthMeter
                            key={w}
                            label={w}
                            value={58 + i * 8}
                            variant="weakness"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4 border-t border-helix-border/40 pt-4">
                      {data.topics.map((t) => (
                        <FeedbackCard
                          key={t.name}
                          title={t.name}
                          body={t.feedback}
                          score={t.score}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <Timeline
                  items={data.timeline.map((t, i) => ({
                    id: `t-${i}`,
                    title: t.event,
                    meta: `${t.time} · ${t.score}`,
                    done: true,
                  }))}
                />
              </TabsContent>

              <TabsContent value="paths">
                <ol className="space-y-4">
                  {data.recommendations.map((r, i) => (
                    <li
                      key={r}
                      className="flex gap-4 rounded-xl border border-helix-border/50 bg-helix-surface/30 px-4 py-4"
                    >
                      <span className="font-display text-2xl font-bold text-helix-copper/50 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold">Mission {i + 1}</p>
                        <p className="mt-1 text-sm leading-relaxed text-helix-muted">{r}</p>
                        <Link
                          to="/curriculum"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-helix-signal hover:underline"
                        >
                          Open curriculum <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </motion.div>
        </MissionFrame>
      </PageTransition>
    </PageStateGate>
  )
}
