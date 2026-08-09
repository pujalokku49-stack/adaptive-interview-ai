export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type SkillDomain =
  | 'communication'
  | 'problem_solving'
  | 'prompt_engineering'
  | 'rag'
  | 'vector_databases'
  | 'agentic_ai'
  | 'production_systems'
  | 'deployment'
  | 'system_design'
  | 'confidence'
  | 'adaptability'
  | 'learning_signals'

export interface DnaSkillNode {
  id: SkillDomain
  label: string
  shortLabel: string
  value: number
  /** Delta applied on the most recent interview turn */
  delta?: number
  category: 'technical' | 'cognitive' | 'signal'
}

export interface LiveCandidateDna {
  skills: Record<SkillDomain, number>
  readiness: number
  turnCount: number
  lastFocus: string | null
  pulsedIds: SkillDomain[]
  history: { turn: number; focus: string; at: number }[]
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
  readiness: number
}

export interface Candidate {
  id: string
  name: string
  role: string
  company?: string
  avatarUrl?: string
  readiness: number
  skills: Partial<Record<SkillDomain, number>>
}

export interface InterviewSession {
  id: string
  title: string
  status: InterviewStatus
  difficulty: Difficulty
  topic: string
  scheduledAt: string
  durationSec: number
  score?: number
  confidence?: number
}

export interface ChatMessage {
  id: string
  role: 'ai' | 'candidate' | 'system'
  content: string
  timestamp: string
  streaming?: boolean
}

export interface ReasoningStep {
  id: string
  label: string
  detail: string
  status: 'pending' | 'active' | 'done'
}

export interface CurriculumDay {
  day: number
  title: string
  description: string
  topics: string[]
  durationMin: number
  completed: boolean
  difficulty: Difficulty
}

export interface KnowledgeNode {
  id: string
  label: string
  group: string
  strength: number
  x?: number
  y?: number
}

export interface KnowledgeEdge {
  source: string
  target: string
  weight: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  earnedAt?: string
  icon: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
  type: 'interview' | 'achievement' | 'system' | 'learning'
}

export interface DebriefResult {
  interviewId: string
  overallScore: number
  radar: { subject: string; score: number; fullMark: number }[]
  timeline: { time: string; event: string; score: number }[]
  topics: { name: string; score: number; feedback: string }[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  passport: KnowledgePassport
}

export interface KnowledgePassport {
  candidateName: string
  role: string
  sessionTitle: string
  issuedAt: string
  overallScore: number
  technicalCommunication: number
  strongestTopics: { name: string; score: number }[]
  weakestTopics: { name: string; score: number }[]
  confidenceTrend: { time: string; value: number }[]
  difficultyProgression: { stage: string; difficulty: Difficulty }[]
  nextMission: {
    title: string
    description: string
    eta: string
    day: number
  }
  topicsMastered: string[]
  topicsRevision: string[]
  stamp: string
}

export interface DashboardData {
  missionProgress: number
  readiness: number
  todayLearning: { title: string; progress: number; eta: string }[]
  heatmap: { day: string; value: number }[]
  recentInterviews: InterviewSession[]
  achievements: Achievement[]
  upcoming: InterviewSession | null
  analytics: { label: string; value: number }[]
}

export interface CandidateDna {
  candidate: Candidate
  skillGraph: { skill: string; value: number }[]
  learningSignals: { label: string; trend: number; note: string }[]
  achievements: Achievement[]
}
