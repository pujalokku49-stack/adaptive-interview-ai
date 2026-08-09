/**
 * Interview API service layer.
 * All backend calls go through here — UI components never call api.ts directly.
 * Each function maps backend envelopes to typed results and adapts backend
 * shapes to frontend-consumable objects.
 */

import { api, ApiError, endpoints } from '@/lib/api'
import type {
  BackendCandidate,
  BackendCandidateListResponse,
  BackendCurriculum,
  BackendEnvelope,
  BackendFinalFeedback,
  BackendFeedback,
  BackendInterviewPlan,
  BackendSession,
} from '@/types/api'
import type { CurriculumDay, DebriefResult } from '@/types'

// ─── Candidates ───────────────────────────────────────────────────────────────

export async function fetchCandidates(): Promise<BackendCandidate[]> {
  const res = await api.get<BackendEnvelope<BackendCandidateListResponse>>(endpoints.candidates)
  return res.data.candidates
}

export async function fetchCandidate(id: string): Promise<BackendCandidate> {
  const res = await api.get<BackendEnvelope<BackendCandidate>>(endpoints.candidate(id))
  return res.data
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

/**
 * Fetches curriculum from backend and adapts it to the frontend CurriculumDay shape.
 * Backend days have { topics: BackendCurriculumTopic[] } but frontend expects { topics: string[] }.
 */
export async function fetchCurriculum(): Promise<CurriculumDay[]> {
  const res = await api.get<BackendEnvelope<BackendCurriculum>>(endpoints.curriculum)
  return adaptCurriculum(res.data)
}

function adaptCurriculum(curriculum: BackendCurriculum): CurriculumDay[] {
  return curriculum.days.map((day, i) => ({
    day: day.day,
    title: day.title,
    description: day.description ?? `Day ${day.day} of the ${curriculum.cohort} curriculum.`,
    topics: day.topics.map((t) => (typeof t === 'string' ? t : t.title)),
    durationMin: day.duration ?? 45,
    completed: false, // Backend has no completion state — keep as false (UI can layer on top)
    difficulty: (['easy', 'medium', 'hard', 'expert'] as const)[Math.min(3, Math.floor(i / 8))],
  }))
}

// ─── Interview Plan ───────────────────────────────────────────────────────────

export async function fetchInterviewPlan(candidateId: string): Promise<BackendInterviewPlan> {
  const res = await api.get<BackendEnvelope<BackendInterviewPlan>>(
    endpoints.interviewPlan(candidateId),
  )
  return res.data
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

/** Start a new interview session for a candidate */
export async function startSession(candidateId: string): Promise<BackendSession> {
  const res = await api.post<BackendEnvelope<BackendSession>>(endpoints.sessions, { candidateId })
  return res.data
}

/** Get current session state */
export async function fetchSession(sessionId: string): Promise<BackendSession> {
  const res = await api.get<BackendEnvelope<BackendSession>>(endpoints.session(sessionId))
  return res.data
}

/** Submit an answer to the current question */
export async function submitAnswer(sessionId: string, answer: string): Promise<BackendSession> {
  const res = await api.post<BackendEnvelope<BackendSession>>(
    endpoints.submitAnswer(sessionId),
    { answer },
  )
  return res.data
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

/** Get heuristic feedback for a completed session (Module 8) */
export async function fetchSessionFeedback(sessionId: string): Promise<BackendFeedback> {
  const res = await api.get<BackendEnvelope<BackendFeedback>>(
    endpoints.sessionFeedback(sessionId),
  )
  return res.data
}

/** Get full LLM-synthesized final feedback report (Module 9) */
export async function fetchFinalFeedback(sessionId: string): Promise<BackendFinalFeedback> {
  const res = await api.get<BackendEnvelope<BackendFinalFeedback>>(
    endpoints.finalFeedback(sessionId),
  )
  return res.data
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

/**
 * Converts backend FinalFeedbackReport + BackendSession into the frontend DebriefResult shape.
 * Falls back to heuristic feedback shape if final-feedback is unavailable.
 */
export function adaptToDebriefResult(
  sessionId: string,
  session: BackendSession,
  finalFeedback: BackendFinalFeedback,
  candidateName = 'Candidate',
  jobRole = 'Engineer',
): DebriefResult {
  const topicCount = session.topicsCovered.length || 1
  const overallPct = Math.min(100, Math.round((finalFeedback.overallScore / 10) * 100))

  // Build radar from topic scores — up to 6 subjects
  const radarSubjects = finalFeedback.topicScores.length > 0
    ? finalFeedback.topicScores.slice(0, 6).map((ts) => ({
        subject: ts.topic,
        score: Math.min(100, Math.round((ts.score / 10) * 100)),
        fullMark: 100,
      }))
    : session.topicsCovered.slice(0, 6).map((topic, i) => ({
        subject: topic,
        score: Math.max(30, overallPct - i * 5),
        fullMark: 100,
      }))

  // Build timeline from history
  const timeline = session.history.map((entry, i) => ({
    time: `${String(Math.floor((i * 3) / 60)).padStart(2, '0')}:${String((i * 3) % 60).padStart(2, '0')}`,
    event: entry.evaluation
      ? entry.evaluation.slice(0, 60) + (entry.evaluation.length > 60 ? '…' : '')
      : `Q${i + 1}: ${entry.question.slice(0, 50)}…`,
    score: Math.round((entry.score / 10) * 100),
  }))

  // Build topics from topic scores
  const topics = finalFeedback.topicScores.map((ts) => ({
    name: ts.topic,
    score: Math.min(100, Math.round((ts.score / 10) * 100)),
    feedback: session.history.find((h) => h.evaluation)?.evaluation ?? 'See full report.',
  }))

  const strongestTopics = finalFeedback.topicScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((ts) => ({ name: ts.topic, score: Math.round((ts.score / 10) * 100) }))

  const weakestTopics = finalFeedback.topicScores
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((ts) => ({ name: ts.topic, score: Math.round((ts.score / 10) * 100) }))

  // Confidence trend from history scores
  const confidenceTrend = [
    { time: 'Start', value: 65 },
    ...session.history.map((entry, i) => ({
      time: `Q${i + 1}`,
      value: Math.min(99, Math.round(60 + (entry.score / 10) * 40)),
    })),
    { time: 'End', value: overallPct },
  ]

  // Difficulty progression
  const difficultyProgression = session.history.slice(0, 4).map((_, i) => ({
    stage: ['Warm-up', 'Core probe', 'Deep dive', 'Production stress'][i] ?? `Stage ${i + 1}`,
    difficulty: session.difficulty,
  }))

  return {
    interviewId: sessionId,
    overallScore: overallPct,
    radar: radarSubjects,
    timeline,
    topics,
    strengths: finalFeedback.strengths,
    weaknesses: finalFeedback.weaknesses,
    recommendations: finalFeedback.improvementSuggestions.slice(0, 5),
    passport: {
      candidateName,
      role: jobRole,
      sessionTitle: `${session.topicsCovered[0] ?? 'AI Engineering'} Interview · ${topicCount} topic${topicCount !== 1 ? 's' : ''}`,
      issuedAt: new Date(session.updatedAt).toISOString().split('T')[0],
      overallScore: overallPct,
      technicalCommunication: Math.min(100, overallPct + 4),
      strongestTopics,
      weakestTopics,
      confidenceTrend,
      difficultyProgression,
      nextMission: {
        title: finalFeedback.knowledgeGaps[0]
          ? `${finalFeedback.knowledgeGaps[0]} — Remediation`
          : 'Advanced System Design',
        description:
          finalFeedback.improvementSuggestions[0] ??
          'Continue with the next curriculum module to reinforce weak areas.',
        eta: '45 min',
        day: session.topicsCovered.length + 1,
      },
      topicsMastered: session.topicsCovered.filter((_, i) => {
        const score = finalFeedback.topicScores[i]?.score ?? 0
        return score >= 7
      }),
      topicsRevision: [
        ...finalFeedback.knowledgeGaps.slice(0, 3),
        ...finalFeedback.missedConcepts.slice(0, 2),
      ],
      stamp: `HELIX-KP-${String(overallPct).padStart(3, '0')}`,
    },
  }
}

/**
 * Determines if an ApiError is recoverable (network/502/503) or terminal (400/404/409).
 */
export function isTransientError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.status >= 500 || err.status === 0
  }
  return !(err instanceof ApiError) // Unknown errors are treated as transient
}
