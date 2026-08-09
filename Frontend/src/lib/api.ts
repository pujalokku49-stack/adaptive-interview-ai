/**
 * API client — proxied via Vite dev server (/api → http://localhost:4000)
 * or via VITE_API_URL for production overrides.
 */

const BASE_URL =
  (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_API_URL ?? '/api/v1'

const API_KEY =
  (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_API_KEY

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
    headers['Authorization'] = `Bearer ${API_KEY}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = undefined
    }
    throw new ApiError(`Request failed: ${res.status}`, res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/** Backend endpoint map — source of truth for all API calls */
export const endpoints = {
  // Candidates
  candidates: '/candidates',
  candidate: (id: string) => `/candidates/${id}`,

  // Curriculum
  curriculum: '/curriculum',

  // Interview plan
  interviewPlan: (candidateId: string) => `/interview-plan/${candidateId}`,

  // Sessions
  sessions: '/sessions',
  session: (sessionId: string) => `/sessions/${sessionId}`,
  submitAnswer: (sessionId: string) => `/sessions/${sessionId}/answers`,
  sessionFeedback: (sessionId: string) => `/sessions/${sessionId}/feedback`,

  // Module 9 final feedback
  finalFeedback: (sessionId: string) => `/sessions/${sessionId}/final-feedback`,

  // Analytics
  cohortAnalytics: '/analytics/cohort',
  candidateAnalytics: (candidateId: string) => `/analytics/candidates/${candidateId}`,
} as const

