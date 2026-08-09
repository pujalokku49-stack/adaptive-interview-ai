import type { DnaSkillNode, SkillDomain } from '@/types'

export const DNA_SKILL_META: Record<
  SkillDomain,
  { label: string; shortLabel: string; category: DnaSkillNode['category'] }
> = {
  communication: { label: 'Communication', shortLabel: 'Comm', category: 'cognitive' },
  problem_solving: { label: 'Problem Solving', shortLabel: 'Solve', category: 'cognitive' },
  prompt_engineering: { label: 'Prompt Engineering', shortLabel: 'Prompt', category: 'technical' },
  rag: { label: 'RAG', shortLabel: 'RAG', category: 'technical' },
  vector_databases: { label: 'Vector Databases', shortLabel: 'Vectors', category: 'technical' },
  agentic_ai: { label: 'Agentic AI', shortLabel: 'Agents', category: 'technical' },
  production_systems: { label: 'Production Systems', shortLabel: 'Prod', category: 'technical' },
  deployment: { label: 'Deployment', shortLabel: 'Deploy', category: 'technical' },
  system_design: { label: 'System Design', shortLabel: 'Design', category: 'technical' },
  confidence: { label: 'Confidence', shortLabel: 'Conf', category: 'signal' },
  adaptability: { label: 'Adaptability', shortLabel: 'Adapt', category: 'cognitive' },
  learning_signals: { label: 'Learning Signals', shortLabel: 'Learn', category: 'signal' },
}

export const DNA_SKILL_ORDER: SkillDomain[] = [
  'communication',
  'problem_solving',
  'prompt_engineering',
  'rag',
  'vector_databases',
  'agentic_ai',
  'production_systems',
  'deployment',
  'system_design',
  'confidence',
  'adaptability',
  'learning_signals',
]

/** Baseline genome — mid-session interview already underway */
export const BASELINE_DNA_SKILLS: Record<SkillDomain, number> = {
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
}

/** Scripted mastery deltas applied after each candidate answer */
export const TURN_DNA_UPDATES: Array<{
  focus: string
  deltas: Partial<Record<SkillDomain, number>>
}> = [
  {
    focus: 'RAG · retrieval conflict',
    deltas: {
      rag: 4,
      vector_databases: 3,
      prompt_engineering: 2,
      problem_solving: 3,
      communication: 2,
      production_systems: -1,
      confidence: 2,
      adaptability: 1,
      learning_signals: 3,
      system_design: 2,
    },
  },
  {
    focus: 'Production · silent degradation',
    deltas: {
      production_systems: 5,
      deployment: 4,
      system_design: 3,
      rag: 1,
      problem_solving: 2,
      communication: 1,
      agentic_ai: -1,
      confidence: 1,
      adaptability: 4,
      learning_signals: 2,
    },
  },
  {
    focus: 'Agents · tool routing',
    deltas: {
      agentic_ai: 6,
      prompt_engineering: 4,
      production_systems: 2,
      communication: 2,
      problem_solving: 3,
      confidence: 3,
      adaptability: 2,
      learning_signals: 4,
      deployment: 2,
      system_design: 1,
    },
  },
  {
    focus: 'Design · multi-agent scale',
    deltas: {
      system_design: 5,
      agentic_ai: 3,
      deployment: 3,
      vector_databases: 2,
      production_systems: 3,
      communication: 3,
      problem_solving: 2,
      confidence: 2,
      adaptability: 3,
      learning_signals: 3,
      prompt_engineering: 1,
    },
  },
]

export function clampSkill(value: number) {
  return Math.max(8, Math.min(98, Math.round(value)))
}

export function computeReadiness(skills: Record<SkillDomain, number>) {
  const values = DNA_SKILL_ORDER.map((id) => skills[id])
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round(avg)
}

export function toDnaSkillNodes(
  skills: Record<SkillDomain, number>,
  deltas?: Partial<Record<SkillDomain, number>>,
): DnaSkillNode[] {
  return DNA_SKILL_ORDER.map((id) => ({
    id,
    ...DNA_SKILL_META[id],
    value: skills[id],
    delta: deltas?.[id],
  }))
}
