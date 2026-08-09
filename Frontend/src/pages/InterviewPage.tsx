import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/Button'
import { ChatBubble } from '@/components/shared/ChatBubble'
import {
  AIThinkingChatStatus,
  THINKING_CYCLE_MS,
  useAIThinking,
} from '@/components/shared/AIThinkingPanel'
import { useInterviewMemory } from '@/components/shared/AIMemoryPanel'
import { useLiveKnowledgeGraph } from '@/components/shared/InteractiveKnowledgeGraph'
import { InterviewProgress, SessionTimer } from '@/components/shared/SessionTimer'
import { ProgressCircle } from '@/components/ui/ProgressCircle'
import { TopicBadge } from '@/components/ui/Badge'
import { AIAvatar } from '@/components/shared/Avatars'
import {
  AdaptCascadeBanner,
  AnimatedDifficultyBadge,
} from '@/components/shared/ChamberAdapt'
import {
  BASELINE_REASONING,
  BASELINE_TIMELINE,
  CHAMBER_TURN_SCRIPTS,
  TOTAL_QUESTIONS,
  progressPct,
  questionFromTurn,
} from '@/data/chamberEvolution'
import type { ChatMessage, ReasoningStep } from '@/types'
import { Send } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { useCandidateDna } from '@/context/CandidateDnaContext'
import { useInterview } from '@/context/InterviewContext'
import { useUser } from '@/context/UserContext'
import { ChamberRail } from '@/components/shared/ChamberRail'
import { PageStateGate } from '@/components/states'
import { usePageState } from '@/hooks/usePageState'
import { fetchCandidates, startSession, submitAnswer } from '@/services/interviewApi'
import { ApiError } from '@/lib/api'

const ADAPT_SURFACE_IDS = [
  'confidence',
  'dna',
  'graph',
  'memory',
  'reasoning',
  'timeline',
] as const

const DEFAULT_CANDIDATE_ID = 'CAND-001'

/** Interview Chamber — wired to real backend session API */
export function InterviewPage() {
  const { profile } = useUser()
  const { state, retry, setFailed } = usePageState({ loadMs: 550 })
  const {
    session,
    setSession,
    setCandidateId,
    candidateId,
    setIsStarting,
    setError: setCtxError,
  } = useInterview()

  // Chat messages — seed with a system message; first AI question comes from backend
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (session?.currentQuestion) {
      return [
        {
          id: 'sys-1',
          role: 'system',
          content: `Interview chamber synchronized. Adaptive difficulty: ${session.difficulty}.`,
          timestamp: session.createdAt,
        },
        {
          id: 'q-1',
          role: 'ai',
          content: session.currentQuestion,
          timestamp: session.createdAt,
        },
      ]
    }
    return [
      {
        id: 'sys-1',
        role: 'system',
        content: 'Interview chamber initializing…',
        timestamp: new Date().toISOString(),
      },
    ]
  })

  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [confidence, setConfidence] = useState(0.81)
  const [confidencePulse, setConfidencePulse] = useState(false)
  const [progressPulse, setProgressPulse] = useState(false)
  const [difficultyFlash, setDifficultyFlash] = useState(false)
  const [topic, setTopic] = useState(session?.currentTopic ?? 'Retrieval Systems')
  const [timelineBeats, setTimelineBeats] = useState(BASELINE_TIMELINE)
  const [timelineGrowKey, setTimelineGrowKey] = useState(0)
  const [reasoning, setReasoning] = useState<ReasoningStep[]>(BASELINE_REASONING)
  const [adaptBanner, setAdaptBanner] = useState(false)
  const [adaptSummary, setAdaptSummary] = useState('')
  const [adaptSurfaces, setAdaptSurfaces] = useState<string[]>([])
  const [scriptIndex, setScriptIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevDifficulty = useRef<'easy' | 'medium' | 'hard' | 'expert'>('hard')
  const { toast } = useToast()
  const thinkingState = useAIThinking(thinking)
  const { memory, updating, flashKey, beginMemoryWrite, commitMemoryTurn } =
    useInterviewMemory()
  const {
    nodes: graphNodes,
    edges: graphEdges,
    pulseIds,
    currentId,
  } = useLiveKnowledgeGraph(memory.turnCount, true)
  const {
    skillNodes,
    pulsedIds: dnaPulseIds,
    readiness,
    lastFocus,
    turnCount: dnaTurnCount,
    applyInterviewTurn,
    syncConfidence,
  } = useCandidateDna()

  const questionNum = questionFromTurn(memory.turnCount)
  const ringPct = progressPct(memory.turnCount)

  // ── Bootstrap: load first candidate and start session if none exists ──────
  useEffect(() => {
    if (session) return // Resume existing session

    let cancelled = false
    async function bootstrap() {
      setIsStarting(true)
      try {
        // 1. Get candidate list — use first available or fallback to CAND-001
        let resolvedCandidateId = candidateId ?? DEFAULT_CANDIDATE_ID
        try {
          const candidates = await fetchCandidates()
          if (candidates.length > 0) {
            resolvedCandidateId = candidates[0].id
          }
        } catch {
          // If we can't list candidates, use the default — non-fatal
        }

        if (cancelled) return
        setCandidateId(resolvedCandidateId)

        // 2. Start session
        const newSession = await startSession(resolvedCandidateId)
        if (cancelled) return

        setSession(newSession)

        // 3. Seed chat with first question from backend
        const firstQuestion = newSession.currentQuestion
        const firstTopic = newSession.currentTopic ?? 'Interview'

        setMessages([
          {
            id: 'sys-1',
            role: 'system',
            content: `Interview chamber synchronized. Adaptive difficulty: ${newSession.difficulty}.`,
            timestamp: newSession.createdAt,
          },
          ...(firstQuestion
            ? [
                {
                  id: 'q-1',
                  role: 'ai' as const,
                  content: firstQuestion,
                  timestamp: newSession.createdAt,
                },
              ]
            : []),
        ])

        setTopic(firstTopic)
        toast({
          title: 'Chamber active',
          description: `Interview started for ${resolvedCandidateId}`,
          variant: 'success',
        })
      } catch (err) {
        if (cancelled) return
        const msg =
          err instanceof ApiError
            ? `Backend error (${err.status}): ${err.message}`
            : 'Could not connect to interview backend. Check that the server is running.'
        setCtxError(msg)
        setFailed(true)
        toast({ title: 'Chamber failed to start', description: msg, variant: 'error' })
      } finally {
        if (!cancelled) setIsStarting(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking, thinkingState.stageIndex, adaptBanner])

  useEffect(() => {
    syncConfidence(confidence)
  }, [confidence, syncConfidence])

  useEffect(() => {
    if (prevDifficulty.current !== memory.difficulty) {
      prevDifficulty.current = memory.difficulty
      setDifficultyFlash(true)
      const t = window.setTimeout(() => setDifficultyFlash(false), 1800)
      return () => window.clearTimeout(t)
    }
  }, [memory.difficulty])

  const timelineItems = useMemo(() => {
    const nextPending =
      thinking || scriptIndex < CHAMBER_TURN_SCRIPTS.length
        ? {
            id: 'pending',
            title: thinking
              ? 'AI composing next probe…'
              : (CHAMBER_TURN_SCRIPTS[scriptIndex]?.timelineBeat.title ?? 'Next probe'),
            meta: thinking ? 'Now' : 'Next',
            active: true,
            done: false,
          }
        : null

    return [
      ...timelineBeats.map((b) => ({
        id: b.id,
        title: b.title,
        meta: b.meta,
        done: true,
        active: false,
      })),
      ...(nextPending ? [nextPending] : []),
    ]
  }, [timelineBeats, thinking, scriptIndex])

  const runAdaptCascade = (summary: string) => {
    setAdaptSummary(summary)
    setAdaptBanner(true)
    setAdaptSurfaces([])
    ADAPT_SURFACE_IDS.forEach((id, i) => {
      window.setTimeout(() => {
        setAdaptSurfaces((prev) => [...prev, id])
      }, 90 * i)
    })
    window.setTimeout(() => setAdaptBanner(false), 4200)
  }

  const send = useCallback(async () => {
    if (!input.trim() || thinking) return
    const content = input.trim()
    const turnScript =
      CHAMBER_TURN_SCRIPTS[Math.min(scriptIndex, CHAMBER_TURN_SCRIPTS.length - 1)]

    setInput('')
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: 'candidate',
        content,
        timestamp: new Date().toISOString(),
      },
    ])

    // Reasoning moves to active scoring while thinking
    setReasoning((prev) =>
      prev.map((step, i) => ({
        ...step,
        status: i < prev.length - 1 ? 'done' : 'active',
        detail:
          i === prev.length - 1
            ? 'Scoring this answer across memory, gaps, and confidence…'
            : step.detail,
      })),
    )
    beginMemoryWrite()
    setThinking(true)

    // ── Call backend API ───────────────────────────────────────────────────
    let nextQuestion: string | null = null
    let nextTopic: string | null = null
    let adaptDescription = 'Confidence · DNA · graph · memory · reasoning · timeline'
    let updatedSession = session

    if (session) {
      try {
        const result = await submitAnswer(session.sessionId, content)
        setSession(result)
        updatedSession = result
        nextQuestion = result.currentQuestion
        nextTopic = result.currentTopic
        adaptDescription = `Topic: ${result.currentTopic ?? 'N/A'} · Difficulty: ${result.difficulty}`
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? `Answer submission failed (${err.status})`
            : 'Network error submitting answer'
        toast({ title: 'Backend error', description: msg, variant: 'error' })
        // Fall through to visual animation even on error — degrade gracefully
      }
    }
    // ── End backend call ───────────────────────────────────────────────────

    window.setTimeout(() => {
      // 1) Memory + difficulty
      commitMemoryTurn()

      // 2) DNA genome
      applyInterviewTurn()

      // 3) Confidence meter
      setConfidence((c) =>
        Math.min(0.96, c + (turnScript?.confidenceDelta ?? 0.03)),
      )
      setConfidencePulse(true)
      window.setTimeout(() => setConfidencePulse(false), 1400)

      // 4) Reasoning panel — turn-specific steps
      if (turnScript) {
        setReasoning(turnScript.reasoning)
        if (!nextTopic) setTopic(turnScript.topic)

        // 5) Timeline growth
        setTimelineBeats((prev) => {
          if (prev.some((b) => b.id === turnScript.timelineBeat.id)) return prev
          return [...prev, turnScript.timelineBeat]
        })
        setTimelineGrowKey((k) => k + 1)
      }

      // Update topic from backend if available
      if (nextTopic) setTopic(nextTopic)

      // 6) Progress ring / bar pulse
      setProgressPulse(true)
      window.setTimeout(() => setProgressPulse(false), 1200)

      setScriptIndex((i) => Math.min(i + 1, CHAMBER_TURN_SCRIPTS.length))
      setThinking(false)

      // Reply from backend or fallback to scripted/default
      const reply =
        nextQuestion ??
        turnScript?.aiReply ??
        (updatedSession?.status === 'completed'
          ? '✓ Interview complete. Navigate to /debrief to see your full report.'
          : 'Noted. What tradeoff would you accept to keep citation SLA green under load?')

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'ai',
          content: reply,
          timestamp: new Date().toISOString(),
          streaming: true,
        },
      ])

      runAdaptCascade(adaptDescription)

      toast({
        title: updatedSession?.status === 'completed' ? 'Interview complete' : 'Chamber adapted',
        description: adaptDescription,
        variant: 'success',
      })

      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.streaming ? { ...msg, streaming: false } : msg)),
        )
      }, 1800)
    }, THINKING_CYCLE_MS)
  }, [
    input,
    thinking,
    scriptIndex,
    session,
    beginMemoryWrite,
    commitMemoryTurn,
    applyInterviewTurn,
    setSession,
    toast,
  ])

  const atmosphereIntensity = Math.min(1, (memory.turnCount - 1) / 6)

  return (
    <PageStateGate state={state} kind="interview" onRetry={retry} wrapTransition={false}>
    <PageTransition>
      <div className="flex h-[calc(100svh-4.25rem)] flex-col lg:flex-row">
        <div className="relative flex min-w-0 flex-1 flex-col border-b border-helix-border/60 lg:border-b-0 lg:border-r">
          {/* Evolving chamber atmosphere */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{
              background: `radial-gradient(ellipse at top, rgba(62,224,197,${0.03 + atmosphereIntensity * 0.06}), transparent 55%), radial-gradient(ellipse at bottom right, rgba(232,168,124,${0.02 + atmosphereIntensity * 0.05}), transparent 50%)`,
            }}
            transition={{ duration: 1.2 }}
          />

          <div className="relative flex flex-wrap items-center gap-3 border-b border-helix-border/60 bg-helix-surface/30 px-4 py-3.5 backdrop-blur-md md:px-6">
            <AIAvatar thinking={thinking && thinkingState.current?.id !== 'ready'} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-base font-semibold">Interview Chamber</h1>
                <span className="status-chip">
                  {thinking
                    ? (thinkingState.current?.label ?? 'Thinking')
                    : updating
                      ? 'Memory write'
                      : adaptBanner
                        ? 'Adapting'
                        : 'Adaptive'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <AnimatedDifficultyBadge
                  difficulty={memory.difficulty}
                  flash={difficultyFlash}
                />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                  >
                    <TopicBadge topic={topic} />
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <SessionTimer initialSeconds={184} />
            <motion.div
              animate={progressPulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.55 }}
              title="Interview progress"
            >
              <ProgressCircle
                value={ringPct}
                size={52}
                strokeWidth={5}
                color="var(--color-helix-copper)"
                label={`${questionNum}/${TOTAL_QUESTIONS}`}
              />
            </motion.div>
          </div>

          <div className="relative flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
            <InterviewProgress
              current={questionNum}
              total={TOTAL_QUESTIONS}
              pulse={progressPulse}
            />

            <AdaptCascadeBanner
              visible={adaptBanner}
              summary={adaptSummary}
              activeIds={adaptSurfaces}
            />

            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} candidateName={profile.name} />
            ))}
            <AnimatePresence>
              {thinking && (
                <AIThinkingChatStatus stageLabel={thinkingState.current?.label} />
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="relative border-t border-helix-border/60 bg-helix-surface/40 p-4 backdrop-blur-md md:px-6">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
                rows={2}
                placeholder={
                  thinking
                    ? 'Helix is reasoning — response locked…'
                    : 'Respond to the probe… (Enter to send)'
                }
                disabled={thinking}
                className="flex-1 resize-none rounded-xl border border-helix-border/70 bg-helix-elevated/40 px-3 py-2 text-sm outline-none transition focus-visible:border-helix-signal/50 focus-visible:ring-2 focus-visible:ring-helix-signal/25 disabled:opacity-60"
              />
              <Button className="self-end !px-4" onClick={() => void send()} disabled={thinking}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ChamberRail
          confidence={confidence}
          confidencePulse={confidencePulse}
          readiness={readiness}
          skillNodes={skillNodes}
          dnaPulseIds={dnaPulseIds}
          lastFocus={lastFocus}
          dnaTurnCount={dnaTurnCount}
          thinking={thinking}
          thinkingState={thinkingState}
          reasoning={reasoning}
          memory={memory}
          updating={updating}
          flashKey={flashKey}
          graphNodes={graphNodes}
          graphEdges={graphEdges}
          pulseIds={pulseIds}
          currentId={currentId}
          timelineItems={timelineItems}
          timelineGrowKey={timelineGrowKey}
          progressPulse={progressPulse}
        />
      </div>
    </PageTransition>
    </PageStateGate>
  )
}


