import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface UserProfile {
  name: string
  email: string
  role: string
  notifyInterview: boolean
  notifyAchieve: boolean
}

const STORAGE_KEY = 'helix-user-profile'

export const defaultUserProfile: UserProfile = {
  name: 'Maya Chen',
  email: 'maya@helix.ai',
  role: 'Staff Engineer',
  notifyInterview: true,
  notifyAchieve: true,
}

export function loadSavedProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...defaultUserProfile, ...JSON.parse(raw) }
    }
  } catch {
    // Fall back to default profile if storage read fails
  }
  return defaultUserProfile
}

interface UserContextValue {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(loadSavedProfile)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // Storage write error
    }
  }, [profile])

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
