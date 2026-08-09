import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type AppViewState = 'loading' | 'ready' | 'empty' | 'error' | 'offline' | 'success'

const DEMO_STATES: AppViewState[] = ['loading', 'empty', 'error', 'offline', 'success', 'ready']

export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return online
}

/**
 * Bootstraps polished page states:
 * - brief skeleton load on mount
 * - offline detection
 * - demo via ?state=loading|empty|error|offline|success|ready
 */
export function usePageState(options?: {
  /** Simulated fetch duration */
  loadMs?: number
  /** Start empty after load (e.g. no sessions) */
  empty?: boolean
  /** Force error after load */
  error?: boolean
}) {
  const { loadMs = 700, empty = false, error = false } = options ?? {}
  const [searchParams, setSearchParams] = useSearchParams()
  const online = useOnlineStatus()
  const demo = searchParams.get('state') as AppViewState | null

  const [booting, setBooting] = useState(true)
  const [failed, setFailed] = useState(error)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setBooting(true)
    const t = window.setTimeout(() => setBooting(false), loadMs)
    return () => window.clearTimeout(t)
  }, [loadMs])

  const retry = useCallback(() => {
    setFailed(false)
    setBooting(true)
    window.setTimeout(() => setBooting(false), loadMs)
  }, [loadMs])

  const setDemoState = useCallback(
    (state: AppViewState | null) => {
      const next = new URLSearchParams(searchParams)
      if (!state || state === 'ready') next.delete('state')
      else next.set('state', state)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const flashSuccess = useCallback((ms = 3200) => {
    setShowSuccess(true)
    window.setTimeout(() => setShowSuccess(false), ms)
  }, [])

  let state: AppViewState = 'ready'
  if (demo && DEMO_STATES.includes(demo)) {
    state = demo
  } else if (!online) {
    state = 'offline'
  } else if (booting) {
    state = 'loading'
  } else if (failed) {
    state = 'error'
  } else if (empty) {
    state = 'empty'
  } else if (showSuccess) {
    state = 'success'
  }

  return {
    state,
    online,
    isLoading: state === 'loading',
    isReady: state === 'ready',
    isEmpty: state === 'empty',
    isError: state === 'error',
    isOffline: state === 'offline',
    isSuccess: state === 'success',
    retry,
    setDemoState,
    flashSuccess,
    setFailed,
  }
}
