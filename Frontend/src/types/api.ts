/**
 * Backend contract types — mirror exact shapes returned by the backend API.
 * These are NOT the same as frontend display types in @/types/index.ts.
 * Adapters in @/services/interviewApi.ts convert between these.
 */

/** Envelope wrapping every backend response */
export interface BackendEnvelope<T> {
  status: 'ok' | 'error'
  data: T
}

// ─── Candidate ───────────────────────────────────────────────────────────────

export interface BackendMission {
  day: number
  title: string
  passed: boolean
  skipped: boolean
  attempts: number
}

export interface BackendSignals {
  commitDays: number
  missionsCompleted: number
  missionsFirstTry: number
}

export interface BackendCandidate {
  id: string
  fullName: string
  jobRole: string
  yearsExperience: number
  education: string
  status: string
  missions: BackendMission[]
  signals: BackendSignals
}

export interface BackendCandidateListResponse {
  candidates: BackendCandidate[]
  total: number
  page: number
  limit: number
}

// ─── Curriculum ──────────────────────────────────────────────────────────────

export interface BackendCurriculumTopic {
  title: string
  description: string
  learningObjectives?: string[]
}

export interface BackendCurriculumDay {
  day: number
  title: string
  description?: string
  topics: BackendCurriculumTopic[]
  duration?: number
}

export interface BackendCurriculum {
  cohort: string
  days: BackendCurriculumDay[]
}

// ─── Interview Plan ──────────────────────────────────────────────────────────

export interface BackendFocusArea {
  dayTitle: string
  reason: string
  suggestedDifficulty: 'easy' | 'medium' | 'hard'
}

export interface BackendInterviewPlan {
  candidateId: string
  candidateName: string
  jobRole: string
  strengths: BackendFocusArea[]
  gaps: BackendFocusArea[]
  suggestedQuestions: string[]
  generatedAt: string
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface BackendQuestionEvaluation {
  question: string
  answer: string
  evaluation: string
  score: number
  knowledgeGap: string[]
  strongAreas: string[]
  weakAreas: string[]
}

export interface BackendSession {
  sessionId: string
  candidateId: string
  currentQuestion: string | null
  currentTopic: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  questionsAsked: number
  topicsCovered: string[]
  remainingTopics: string[]
  score: number
  history: BackendQuestionEvaluation[]
  status: 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export interface BackendFeedback {
  summary: string
  strengths: string[]
  gaps: string[]
  next: string[]
}

// ─── Final Feedback (Module 9) ────────────────────────────────────────────────

export interface BackendTopicScore {
  topic: string
  score: number
}

export interface BackendFinalFeedback {
  candidateId: string
  overallScore: number
  topicScores: BackendTopicScore[]
  strengths: string[]
  weaknesses: string[]
  missedConcepts: string[]
  knowledgeGaps: string[]
  improvementSuggestions: string[]
  learningResources: string[]
  recommendedNextDifficulty: 'easy' | 'medium' | 'hard'
  generatedAt: string
}

