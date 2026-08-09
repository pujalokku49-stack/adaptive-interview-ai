import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LiveCandidateDna, SkillDomain } from '@/types'
import {
  BASELINE_DNA_SKILLS,
  DNA_SKILL_META,
  TURN_DNA_UPDATES,
  clampSkill,
  computeReadiness,
  toDnaSkillNodes,
} from '@/data/dnaSkills'

const STORAGE_KEY = 'helix-candidate-dna'

type CandidateDnaContextValue = LiveCandidateDna & {
  skillNodes: ReturnType<typeof toDnaSkillNodes>
  radarData: { subject: string; score: number; fullMark: number }[]
  applyInterviewTurn: () => void
  syncConfidence: (confidence01: number) => void
  resetDna: () => void
  lastDeltas: Partial<Record<SkillDomain, number>>
}

const CandidateDnaContext = createContext<CandidateDnaContextValue | null>(null)

function loadStored(): LiveCandidateDna | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LiveCandidateDna
  } catch {
    return null
  }
}

function createBaseline(turnCount = 2): LiveCandidateDna {
  return {
    skills: { ...BASELINE_DNA_SKILLS },
    readiness: computeReadiness(BASELINE_DNA_SKILLS),
    turnCount,
    lastFocus: 'RAG · retrieval conflict',
    pulsedIds: [],
    history: [{ turn: 2, focus: 'RAG · retrieval conflict', at: Date.now() }],
  }
}

export function CandidateDnaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveCandidateDna>(() => loadStored() ?? createBaseline())
  const [lastDeltas, setLastDeltas] = useState<Partial<Record<SkillDomain, number>>>({})

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const applyInterviewTurn = useCallback(() => {
    setState((prev) => {
      const updateIndex = Math.min(
        Math.max(0, prev.turnCount - 2),
        TURN_DNA_UPDATES.length - 1,
      )
      const update = TURN_DNA_UPDATES[updateIndex]
      const nextSkills = { ...prev.skills }
      const changed: SkillDomain[] = []
      const deltas: Partial<Record<SkillDomain, number>> = {}

      for (const [id, delta] of Object.entries(update.deltas) as [SkillDomain, number][]) {
        nextSkills[id] = clampSkill(nextSkills[id] + delta)
        changed.push(id)
        deltas[id] = delta
      }

      queueMicrotask(() => setLastDeltas(deltas))

      window.setTimeout(() => {
        setState((s) => (s.pulsedIds.length ? { ...s, pulsedIds: [] } : s))
      }, 2600)

      return {
        ...prev,
        skills: nextSkills,
        readiness: computeReadiness(nextSkills),
        turnCount: prev.turnCount + 1,
        lastFocus: update.focus,
        pulsedIds: changed,
        history: [
          ...prev.history,
          { turn: prev.turnCount + 1, focus: update.focus, at: Date.now() },
        ].slice(-8),
      }
    })
  }, [])

  const syncConfidence = useCallback((confidence01: number) => {
    const pct = clampSkill(confidence01 * 100)
    setState((prev) => {
      if (Math.abs(prev.skills.confidence - pct) < 1) return prev
      const skills = { ...prev.skills, confidence: pct }
      return {
        ...prev,
        skills,
        readiness: computeReadiness(skills),
        pulsedIds: [...new Set([...prev.pulsedIds, 'confidence' as SkillDomain])],
      }
    })
  }, [])

  const resetDna = useCallback(() => {
    setLastDeltas({})
    setState(createBaseline(2))
  }, [])

  const skillNodes = useMemo(
    () => toDnaSkillNodes(state.skills, lastDeltas),
    [state.skills, lastDeltas],
  )

  const radarData = useMemo(
    () =>
      skillNodes.map((s) => ({
        subject: s.shortLabel,
        score: s.value,
        fullMark: 100,
      })),
    [skillNodes],
  )

  const value = useMemo<CandidateDnaContextValue>(
    () => ({
      ...state,
      skillNodes,
      radarData,
      applyInterviewTurn,
      syncConfidence,
      resetDna,
      lastDeltas,
    }),
    [state, skillNodes, radarData, applyInterviewTurn, syncConfidence, resetDna, lastDeltas],
  )

  return (
    <CandidateDnaContext.Provider value={value}>{children}</CandidateDnaContext.Provider>
  )
}

export function useCandidateDna() {
  const ctx = useContext(CandidateDnaContext)
  if (!ctx) throw new Error('useCandidateDna must be used within CandidateDnaProvider')
  return ctx
}

export function skillLabel(id: SkillDomain) {
  return DNA_SKILL_META[id].label
}
