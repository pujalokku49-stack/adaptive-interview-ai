import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { CandidateAvatar } from '@/components/shared/Avatars'
import { useUser } from '@/context/UserContext'
import { AnimatePresence, motion } from 'framer-motion'
import { dropdownVariants, springs } from '@/lib/motion'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { profile } = useUser()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={springs.tap}
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-signal/50"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <CandidateAvatar name={profile.name} size="sm" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-helix-border bg-helix-surface shadow-card"
          >
            <div className="border-b border-helix-border px-3 py-3">
              <p className="font-display text-sm font-semibold">{profile.name}</p>
              <p className="truncate text-xs text-helix-muted">{profile.email}</p>
            </div>
            <div className="p-1.5">
              <Link
                to="/dna"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-helix-muted transition-colors hover:bg-helix-elevated hover:text-helix-text"
              >
                <User className="h-4 w-4" /> Candidate DNA
              </Link>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-helix-muted transition-colors hover:bg-helix-elevated hover:text-helix-text"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-helix-muted transition-colors hover:bg-helix-elevated hover:text-helix-text"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
