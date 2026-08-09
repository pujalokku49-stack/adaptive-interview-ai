import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic2,
  Network,
  BookOpen,
  BarChart3,
  Dna,
  Settings,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const commands = [
  { id: 'dash', label: 'Mission Control', to: '/dashboard', icon: LayoutDashboard, keywords: 'home dashboard' },
  { id: 'int', label: 'Interview Chamber', to: '/interview', icon: Mic2, keywords: 'interview session' },
  { id: 'kg', label: 'Knowledge Graph', to: '/knowledge', icon: Network, keywords: 'graph nodes' },
  { id: 'cur', label: 'Curriculum Explorer', to: '/curriculum', icon: BookOpen, keywords: '31 day learn' },
  { id: 'deb', label: 'Knowledge Passport', to: '/debrief', icon: BarChart3, keywords: 'feedback score debrief passport' },
  { id: 'dna', label: 'Candidate DNA', to: '/dna', icon: Dna, keywords: 'skills profile' },
  { id: 'set', label: 'Settings', to: '/settings', icon: Settings, keywords: 'preferences theme' },
]

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return commands
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords.includes(q),
    )
  }, [query])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => Math.min(i + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && filtered[active]) {
        navigate(filtered[active].to)
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, filtered, active, navigate])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-helix-bg/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="panel-float relative z-10 w-full max-w-lg overflow-hidden"
          >
            <div className="relative z-[1] flex items-center gap-3 border-b border-helix-border/60 px-4">
              <Search className="h-4 w-4 text-helix-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a surface…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-helix-muted"
              />
            </div>
            <ul className="relative z-[1] max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-helix-muted">No results</li>
              )}
              {filtered.map((cmd, i) => (
                <li key={cmd.id}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(cmd.to)
                      onClose()
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm',
                      i === active ? 'bg-helix-signal/10 text-helix-signal' : 'text-helix-muted hover:bg-helix-elevated',
                    )}
                  >
                    <cmd.icon className="h-4 w-4" />
                    <span className="font-display font-medium">{cmd.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="relative z-[1] border-t border-helix-border/60 px-4 py-2 text-[10px] uppercase tracking-wider text-helix-muted">
              ↑↓ navigate · ↵ open · esc close
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
