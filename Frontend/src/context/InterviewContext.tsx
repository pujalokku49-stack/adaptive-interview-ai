/**
 * InterviewContext — holds live session state shared between Interview → Debrief.
 * Backed by sessionStorage so state survives page refresh.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { BackendSession, BackendFinalFeedback } from '@/types/api'

const SESSION_STORAGE_KEY = 'helix-session'
const FEEDBACK_STORAGE_KEY = 'helix-final-feedback'
const CANDIDATE_STORAGE_KEY = 'helix-candidate-id'

interface InterviewContextValue {
  /** Active backend session, null if no interview started */
  session: BackendSession | null
  /** The candidateId used to start the session */
  candidateId: string | null
  /** Cached final feedback from completed session */
  finalFeedback: BackendFinalFeedback | null
  /** Whether a session is currently loading/starting */
  isStarting: boolean
  /** Error from last operation */
  error: string | null

  // Setters
  setSession: (session: BackendSession | null) => void
  setCandidateId: (id: string | null) => void
  setFinalFeedback: (feedback: BackendFinalFeedback | null) => void
  setIsStarting: (v: boolean) => void
  setError: (msg: string | null) => void
  clearSession: () => void
}

const InterviewContext = createContext<InterviewContextValue | null>(null)

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    if (value === null) {
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<BackendSession | null>(
    () => loadFromStorage<BackendSession>(SESSION_STORAGE_KEY),
  )
  const [candidateId, setCandidateIdState] = useState<string | null>(
    () => loadFromStorage<string>(CANDIDATE_STORAGE_KEY),
  )
  const [finalFeedback, setFinalFeedbackState] = useState<BackendFinalFeedback | null>(
    () => loadFromStorage<BackendFinalFeedback>(FEEDBACK_STORAGE_KEY),
  )
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync to sessionStorage whenever state changes
  useEffect(() => {
    saveToStorage(SESSION_STORAGE_KEY, session)
  }, [session])

  useEffect(() => {
    saveToStorage(CANDIDATE_STORAGE_KEY, candidateId)
  }, [candidateId])

  useEffect(() => {
    saveToStorage(FEEDBACK_STORAGE_KEY, finalFeedback)
  }, [finalFeedback])

  const setSession = useCallback((s: BackendSession | null) => {
    setSessionState(s)
  }, [])

  const setCandidateId = useCallback((id: string | null) => {
    setCandidateIdState(id)
  }, [])

  const setFinalFeedback = useCallback((fb: BackendFinalFeedback | null) => {
    setFinalFeedbackState(fb)
  }, [])

  const clearSession = useCallback(() => {
    setSessionState(null)
    setFinalFeedbackState(null)
    setError(null)
    saveToStorage(SESSION_STORAGE_KEY, null)
    saveToStorage(FEEDBACK_STORAGE_KEY, null)
  }, [])

  const value = useMemo<InterviewContextValue>(
    () => ({
      session,
      candidateId,
      finalFeedback,
      isStarting,
      error,
      setSession,
      setCandidateId,
      setFinalFeedback,
      setIsStarting,
      setError,
      clearSession,
    }),
    [
      session,
      candidateId,
      finalFeedback,
      isStarting,
      error,
      setSession,
      setCandidateId,
      setFinalFeedback,
      clearSession,
    ],
  )

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>
}

export function useInterview() {
  const ctx = useContext(InterviewContext)
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider')
  return ctx
}
