import type { Difficulty, ReasoningStep } from '@/types'

export interface ChamberTimelineBeat {
  id: string
  title: string
  meta: string
}

export interface ChamberTurnScript {
  aiReply: string
  topic: string
  timelineBeat: ChamberTimelineBeat
  confidenceDelta: number
  /** Absolute target confidence after this turn (0–1) */
  confidenceTarget?: number
  reasoning: ReasoningStep[]
  adaptSummary: string
}

/** Baseline timeline already completed when chamber opens mid-session */
export const BASELINE_TIMELINE: ChamberTimelineBeat[] = [
  { id: 'q1', title: 'Pipeline framing', meta: '00:00' },
  { id: 'q2', title: 'Freshness tradeoffs', meta: '00:12' },
  { id: 'q3', title: 'Index vs re-ranker', meta: '00:24' },
]

export const BASELINE_REASONING: ReasoningStep[] = [
  {
    id: 'r1',
    label: 'Parse answer structure',
    detail: 'Candidate outlined a four-stage pipeline with clear ownership.',
    status: 'done',
  },
  {
    id: 'r2',
    label: 'Probe freshness tradeoffs',
    detail: 'CDC + dual-write mentioned; validate conflict resolution.',
    status: 'done',
  },
  {
    id: 'r3',
    label: 'Stress disagreement case',
    detail: 'Vector vs re-ranker disagreement is high-signal for production thinking.',
    status: 'active',
  },
  {
    id: 'r4',
    label: 'Score confidence',
    detail: 'Awaiting response before updating skill graph.',
    status: 'pending',
  },
]

/** Scripted evolution applied after each candidate answer (in order) */
export const CHAMBER_TURN_SCRIPTS: ChamberTurnScript[] = [
  {
    aiReply:
      'Interesting. How would you detect silent degradation when citation coverage drops but latency stays green?',
    topic: 'Observability',
    timelineBeat: {
      id: 'q4',
      title: 'Silent degradation',
      meta: '00:36',
    },
    confidenceDelta: 0.04,
    reasoning: [
      {
        id: 'r1',
        label: 'Retained dual-write claim',
        detail: 'Memory linked freshness answer to conflict handling.',
        status: 'done',
      },
      {
        id: 'r2',
        label: 'Gap: coverage vs latency',
        detail: 'Candidate has not framed silent failure modes yet.',
        status: 'done',
      },
      {
        id: 'r3',
        label: 'Escalate observability probe',
        detail: 'Next question forces SLO thinking under green latency.',
        status: 'done',
      },
      {
        id: 'r4',
        label: 'Genome + graph write',
        detail: 'Production & learning-signal axes marked for mutation.',
        status: 'active',
      },
    ],
    adaptSummary: 'Memory · DNA · graph · difficulty hold at hard',
  },
  {
    aiReply:
      'Good. Now narrate a production incident: citation coverage slips 12% over 40 minutes. What do you page, freeze, and roll back — in order?',
    topic: 'Incident Response',
    timelineBeat: {
      id: 'q5',
      title: 'Incident narrative',
      meta: '00:48',
    },
    confidenceDelta: 0.03,
    reasoning: [
      {
        id: 'r1',
        label: 'Scored recovery calm',
        detail: 'Candidate held structure under tighter observability probe.',
        status: 'done',
      },
      {
        id: 'r2',
        label: 'Raise difficulty → expert',
        detail: 'Confidence trend supports an incident-pressure turn.',
        status: 'done',
      },
      {
        id: 'r3',
        label: 'Demand ordered ops story',
        detail: 'Page · freeze · rollback sequence is the hiring signal.',
        status: 'done',
      },
      {
        id: 'r4',
        label: 'Sync curriculum graph',
        detail: 'Production & deployment mastery edges pulsing.',
        status: 'active',
      },
    ],
    adaptSummary: 'Difficulty → expert · DNA mutated · timeline grew',
  },
  {
    aiReply:
      'Close the loop: which guardrails and rollback criteria would you ship before enabling multi-agent tool routing in this stack?',
    topic: 'Guardrails',
    timelineBeat: {
      id: 'q6',
      title: 'Guardrails & rollback',
      meta: '01:02',
    },
    confidenceDelta: 0.02,
    reasoning: [
      {
        id: 'r1',
        label: 'Incident order retained',
        detail: 'Prior page/freeze/rollback answer stored in memory.',
        status: 'done',
      },
      {
        id: 'r2',
        label: 'Synthesize ownership',
        detail: 'Connect evals, agents, and shipping decisions.',
        status: 'done',
      },
      {
        id: 'r3',
        label: 'Final systems probe',
        detail: 'Guardrails must precede agent tool expansion.',
        status: 'done',
      },
      {
        id: 'r4',
        label: 'Passport prep',
        detail: 'Session signal ready for Knowledge Passport export.',
        status: 'active',
      },
    ],
    adaptSummary: 'All surfaces synced · passport draft ready',
  },
  {
    aiReply:
      'One more stretch: how would you A/B a re-ranker change without poisoning the evaluation set or the live citation SLA?',
    topic: 'Eval Discipline',
    timelineBeat: {
      id: 'q7',
      title: 'Safe re-ranker A/B',
      meta: '01:14',
    },
    confidenceDelta: 0.02,
    reasoning: [
      {
        id: 'r1',
        label: 'Guardrail literacy confirmed',
        detail: 'Candidate connected rollback to tool-routing risk.',
        status: 'done',
      },
      {
        id: 'r2',
        label: 'Eval isolation check',
        detail: 'Probe whether golden sets stay sealed from traffic.',
        status: 'done',
      },
      {
        id: 'r3',
        label: 'SLA-aware experimentation',
        detail: 'Citation SLA must bound the experiment window.',
        status: 'active',
      },
      {
        id: 'r4',
        label: 'Chamber near complete',
        detail: 'Final mastery deltas writing to DNA & graph.',
        status: 'pending',
      },
    ],
    adaptSummary: 'Progress ring near complete · genome stabilizing',
  },
]

export const TOTAL_QUESTIONS = 7

/** Question index (1-based) derived from memory turn count (starts at 2 mid-session) */
export function questionFromTurn(turnCount: number) {
  return Math.min(TOTAL_QUESTIONS, Math.max(1, turnCount + 1))
}

export function progressPct(turnCount: number) {
  return Math.round((questionFromTurn(turnCount) / TOTAL_QUESTIONS) * 100)
}

export function difficultyTone(d: Difficulty): 'signal' | 'copper' | 'danger' | 'success' {
  if (d === 'easy') return 'success'
  if (d === 'medium') return 'signal'
  if (d === 'hard') return 'copper'
  return 'danger'
}
