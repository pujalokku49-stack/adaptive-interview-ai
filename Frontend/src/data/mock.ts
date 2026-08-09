import type {
  Achievement,
  CandidateDna,
  ChatMessage,
  CurriculumDay,
  DashboardData,
  DebriefResult,
  InterviewSession,
  KnowledgeEdge,
  KnowledgeNode,
  NotificationItem,
  ReasoningStep,
  User,
} from '@/types'

export const currentUser: User = {
  id: 'u_1',
  name: 'Maya Chen',
  email: 'maya@helix.ai',
  role: 'Staff Engineer',
  readiness: 78,
}

export const dashboardData: DashboardData = {
  missionProgress: 62,
  readiness: 78,
  todayLearning: [
    { title: 'RAG Evaluation Patterns', progress: 70, eta: '18 min' },
    { title: 'Agent Tool Routing', progress: 35, eta: '42 min' },
    { title: 'Production Failure Modes', progress: 90, eta: '8 min' },
  ],
  heatmap: [
    { day: 'Mon', value: 2 },
    { day: 'Tue', value: 4 },
    { day: 'Wed', value: 3 },
    { day: 'Thu', value: 5 },
    { day: 'Fri', value: 1 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 3 },
  ],
  recentInterviews: [
    {
      id: 'int_1',
      title: 'System Design Deep Dive',
      status: 'completed',
      difficulty: 'hard',
      topic: 'Distributed Systems',
      scheduledAt: '2026-08-05T14:00:00Z',
      durationSec: 2700,
      score: 84,
      confidence: 0.81,
    },
    {
      id: 'int_2',
      title: 'RAG Architecture',
      status: 'completed',
      difficulty: 'medium',
      topic: 'Retrieval',
      scheduledAt: '2026-08-03T10:30:00Z',
      durationSec: 2100,
      score: 91,
      confidence: 0.88,
    },
    {
      id: 'int_3',
      title: 'Prompt Engineering Lab',
      status: 'completed',
      difficulty: 'easy',
      topic: 'Prompting',
      scheduledAt: '2026-08-01T16:00:00Z',
      durationSec: 1800,
      score: 76,
      confidence: 0.72,
    },
  ],
  achievements: [
    {
      id: 'ach_1',
      title: 'Signal Clarity',
      description: 'Scored 90+ on communication',
      earnedAt: '2026-08-03',
      icon: 'radio',
    },
    {
      id: 'ach_2',
      title: 'Graph Walker',
      description: 'Completed 10 knowledge nodes',
      earnedAt: '2026-07-28',
      icon: 'network',
    },
  ],
  upcoming: {
    id: 'int_4',
    title: 'Multi-Agent Orchestration',
    status: 'scheduled',
    difficulty: 'expert',
    topic: 'Agents',
    scheduledAt: '2026-08-08T15:00:00Z',
    durationSec: 3600,
  },
  analytics: [
    { label: 'Avg Score', value: 84 },
    { label: 'Sessions', value: 18 },
    { label: 'Streak', value: 6 },
    { label: 'Topics', value: 12 },
  ],
}

export const interviewMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'system',
    content: 'Interview chamber synchronized. Adaptive difficulty: Hard.',
    timestamp: '2026-08-07T14:00:00Z',
  },
  {
    id: 'm2',
    role: 'ai',
    content:
      'Design a retrieval pipeline for an enterprise knowledge base with 50M documents. How would you balance latency, freshness, and citation accuracy?',
    timestamp: '2026-08-07T14:00:12Z',
  },
  {
    id: 'm3',
    role: 'candidate',
    content:
      'I would split the pipeline into ingest, index, retrieve, and ground. For freshness I would use CDC into a dual-write vector + keyword store, with a re-ranker that prefers recent chunks when query intent is temporal.',
    timestamp: '2026-08-07T14:02:40Z',
  },
  {
    id: 'm4',
    role: 'ai',
    content:
      'Good structure. Walk me through failure modes when the re-ranker and the vector index disagree on top-k.',
    timestamp: '2026-08-07T14:03:05Z',
  },
]

export const reasoningSteps: ReasoningStep[] = [
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

export const curriculumDays: CurriculumDay[] = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1
  const topics = [
    ['Embeddings', 'Similarity'],
    ['Chunking', 'Metadata'],
    ['Hybrid Search', 'BM25'],
    ['Re-ranking', 'Cross-encoders'],
    ['Eval Sets', 'Golden Answers'],
    ['Agents', 'Tool Use'],
    ['Orchestration', 'Memory'],
    ['Deployment', 'Observability'],
  ][i % 8]
  const titles = [
    'Foundation: Vector Space Intuition',
    'Document Decomposition',
    'Hybrid Retrieval',
    'Precision via Re-ranking',
    'Evaluation Discipline',
    'Agent Tool Contracts',
    'Multi-step Planning',
    'Shipping with Guardrails',
  ]
  return {
    day,
    title: titles[i % 8],
    description: `Day ${day} focuses on ${topics.join(' & ').toLowerCase()} with adaptive drills.`,
    topics,
    durationMin: 35 + (i % 5) * 10,
    completed: day <= 19,
    difficulty: (['easy', 'medium', 'hard', 'expert'] as const)[Math.min(3, Math.floor(i / 8))],
  }
})

export const knowledgeNodes: KnowledgeNode[] = [
  { id: 'n1', label: 'Embeddings', group: 'foundation', strength: 0.9, x: 180, y: 120 },
  { id: 'n2', label: 'Chunking', group: 'foundation', strength: 0.85, x: 320, y: 80 },
  { id: 'n3', label: 'Hybrid Search', group: 'retrieval', strength: 0.78, x: 460, y: 140 },
  { id: 'n4', label: 'Re-ranking', group: 'retrieval', strength: 0.72, x: 400, y: 260 },
  { id: 'n5', label: 'Eval Harness', group: 'quality', strength: 0.68, x: 240, y: 280 },
  { id: 'n6', label: 'Agents', group: 'systems', strength: 0.55, x: 120, y: 220 },
  { id: 'n7', label: 'Tool Routing', group: 'systems', strength: 0.5, x: 80, y: 340 },
  { id: 'n8', label: 'Observability', group: 'production', strength: 0.62, x: 300, y: 380 },
  { id: 'n9', label: 'Guardrails', group: 'production', strength: 0.58, x: 480, y: 340 },
  { id: 'n10', label: 'Caching', group: 'production', strength: 0.7, x: 540, y: 220 },
]

export const knowledgeEdges: KnowledgeEdge[] = [
  { source: 'n1', target: 'n2', weight: 0.9 },
  { source: 'n2', target: 'n3', weight: 0.85 },
  { source: 'n3', target: 'n4', weight: 0.8 },
  { source: 'n4', target: 'n5', weight: 0.75 },
  { source: 'n5', target: 'n8', weight: 0.7 },
  { source: 'n6', target: 'n7', weight: 0.8 },
  { source: 'n7', target: 'n9', weight: 0.65 },
  { source: 'n3', target: 'n10', weight: 0.6 },
  { source: 'n1', target: 'n6', weight: 0.55 },
  { source: 'n8', target: 'n9', weight: 0.7 },
]

export const debriefResult: DebriefResult = {
  interviewId: 'int_1',
  overallScore: 84,
  radar: [
    { subject: 'Clarity', score: 88, fullMark: 100 },
    { subject: 'Depth', score: 82, fullMark: 100 },
    { subject: 'Tradeoffs', score: 90, fullMark: 100 },
    { subject: 'Systems', score: 78, fullMark: 100 },
    { subject: 'Production', score: 74, fullMark: 100 },
    { subject: 'Adaptivity', score: 86, fullMark: 100 },
  ],
  timeline: [
    { time: '00:02', event: 'Strong problem framing', score: 90 },
    { time: '00:12', event: 'Missed cache invalidation', score: 65 },
    { time: '00:24', event: 'Recovered with dual-write plan', score: 88 },
    { time: '00:38', event: 'Cited observability hooks', score: 84 },
  ],
  topics: [
    { name: 'Retrieval', score: 91, feedback: 'Excellent hybrid search intuition.' },
    { name: 'Consistency', score: 72, feedback: 'Conflict resolution was under-specified.' },
    { name: 'Latency', score: 85, feedback: 'Clear p95 budgeting.' },
    { name: 'Safety', score: 78, feedback: 'Guardrails mentioned late.' },
  ],
  strengths: [
    'Structured thinking under pressure',
    'Strong freshness vs latency tradeoffs',
    'Natural citation-first mindset',
  ],
  weaknesses: [
    'Conflict resolution between index and re-ranker',
    'Operational runbooks under-explored',
  ],
  recommendations: [
    'Drill dual-write conflict scenarios for 3 sessions',
    'Add SLO-first framing to opening answers',
    'Practice failure injection storytelling',
  ],
  passport: {
    candidateName: 'Maya Chen',
    role: 'Staff Engineer',
    sessionTitle: 'System Design Deep Dive · Retrieval Systems',
    issuedAt: '2026-08-07',
    overallScore: 84,
    technicalCommunication: 88,
    strongestTopics: [
      { name: 'Hybrid Retrieval', score: 91 },
      { name: 'Latency Budgeting', score: 85 },
      { name: 'Freshness Tradeoffs', score: 90 },
    ],
    weakestTopics: [
      { name: 'Index ↔ Re-ranker Conflict', score: 62 },
      { name: 'Operational Runbooks', score: 58 },
      { name: 'Silent Degradation Detection', score: 64 },
    ],
    confidenceTrend: [
      { time: 'Start', value: 72 },
      { time: 'Q1', value: 78 },
      { time: 'Q2', value: 68 },
      { time: 'Q3', value: 81 },
      { time: 'Q4', value: 86 },
      { time: 'End', value: 84 },
    ],
    difficultyProgression: [
      { stage: 'Warm-up', difficulty: 'medium' },
      { stage: 'Core probe', difficulty: 'hard' },
      { stage: 'Conflict case', difficulty: 'hard' },
      { stage: 'Production stress', difficulty: 'expert' },
    ],
    nextMission: {
      title: 'Conflict Resolution Lab',
      description:
        'Drill dual-write disagreement protocols and SLO-first framing when citation coverage slips.',
      eta: '42 min',
      day: 20,
    },
    topicsMastered: [
      'Hybrid Search',
      'Embeddings Intuition',
      'p95 Latency Framing',
      'Citation-first Grounding',
    ],
    topicsRevision: [
      'Index vs Re-ranker Conflict',
      'CDC Conflict Resolution',
      'Silent Degradation Alerts',
      'Ops Runbook Narratives',
    ],
    stamp: 'HELIX-KP-084',
  },
}

export const candidateDna: CandidateDna = {
  candidate: {
    id: 'c_1',
    name: 'Maya Chen',
    role: 'Staff Engineer',
    company: 'Helix Labs',
    readiness: 73,
    skills: {
      communication: 78,
      problem_solving: 74,
      prompt_engineering: 72,
      rag: 84,
      vector_databases: 79,
      agentic_ai: 61,
      production_systems: 68,
      deployment: 66,
      system_design: 76,
      confidence: 81,
      adaptability: 70,
      learning_signals: 64,
    },
  },
  skillGraph: [
    { skill: 'Communication', value: 78 },
    { skill: 'Problem Solving', value: 74 },
    { skill: 'Prompt Eng', value: 72 },
    { skill: 'RAG', value: 84 },
    { skill: 'Vector DBs', value: 79 },
    { skill: 'Agentic AI', value: 61 },
    { skill: 'Production', value: 68 },
    { skill: 'Deployment', value: 66 },
    { skill: 'System Design', value: 76 },
    { skill: 'Confidence', value: 81 },
    { skill: 'Adaptability', value: 70 },
    { skill: 'Learning', value: 64 },
  ],
  learningSignals: [
    { label: 'Recovery speed', trend: 12, note: 'Faster course-correction after probes' },
    { label: 'Abstraction altitude', trend: 8, note: 'Better L1→L3 transitions' },
    { label: 'Citation discipline', trend: -3, note: 'Slight drop under time pressure' },
    { label: 'Tool selection', trend: 15, note: 'Stronger agent routing intuition' },
  ],
  achievements: [
    {
      id: 'ach_1',
      title: 'Signal Clarity',
      description: 'Scored 90+ on communication',
      earnedAt: '2026-08-03',
      icon: 'radio',
    },
    {
      id: 'ach_3',
      title: 'Retrieval Architect',
      description: 'Mastered hybrid search track',
      earnedAt: '2026-07-20',
      icon: 'layers',
    },
    {
      id: 'ach_4',
      title: '31-Day Momentum',
      description: '19 consecutive curriculum days',
      earnedAt: '2026-08-06',
      icon: 'flame',
    },
  ],
}

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Interview in 18 hours',
    body: 'Multi-Agent Orchestration — Expert difficulty',
    read: false,
    createdAt: '2026-08-07T10:00:00Z',
    type: 'interview',
  },
  {
    id: 'n2',
    title: 'Achievement unlocked',
    body: 'Signal Clarity — communication 90+',
    read: false,
    createdAt: '2026-08-06T18:20:00Z',
    type: 'achievement',
  },
  {
    id: 'n3',
    title: 'Curriculum updated',
    body: 'Day 20 now includes agent eval drills',
    read: true,
    createdAt: '2026-08-06T09:00:00Z',
    type: 'learning',
  },
]

export const upcomingSessions: InterviewSession[] = [
  dashboardData.upcoming!,
  {
    id: 'int_5',
    title: 'Vector DB Internals',
    status: 'scheduled',
    difficulty: 'hard',
    topic: 'Infrastructure',
    scheduledAt: '2026-08-10T11:00:00Z',
    durationSec: 2700,
  },
]

export const testimonials = [
  {
    name: 'Priya Nair',
    role: 'Head of Talent, Northwind',
    quote:
      'Helix replaced our static question banks with interviews that actually adapt. Hire signal jumped in two weeks.',
  },
  {
    name: 'Jonah Reyes',
    role: 'Staff ML Engineer',
    quote:
      'The reasoning panel is the first interview UI that feels like pair-debugging with a senior, not a quiz bot.',
  },
  {
    name: 'Elena Voss',
    role: 'VP Engineering, Latticeform',
    quote:
      'Candidate DNA gave our panel a shared language. Debriefs stopped being opinion wars.',
  },
]

export const faqs = [
  {
    q: 'How does adaptive difficulty work?',
    a: 'Helix scores each response across depth, tradeoffs, and recovery. The next probe tightens or opens based on live confidence — not a fixed script.',
  },
  {
    q: 'Can we bring our own rubric?',
    a: 'Yes. Map your competency model to Helix skill domains. Interviews and DNA reports align to your language.',
  },
  {
    q: 'Is candidate data isolated?',
    a: 'Enterprise tenants run in isolated workspaces with SSO, audit logs, and configurable retention.',
  },
  {
    q: 'Does it support live panel interviews?',
    a: 'Interview Chamber supports AI-led, human-assisted, and full panel modes with shared reasoning visibility.',
  },
]

export const achievementsCatalog: Achievement[] = [
  ...dashboardData.achievements,
  ...candidateDna.achievements.filter((a) => a.id !== 'ach_1'),
]
