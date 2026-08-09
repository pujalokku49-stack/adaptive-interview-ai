import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic2,
  Network,
  BookOpen,
  BarChart3,
  Dna,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { springs } from '@/lib/motion'
import type { LucideIcon } from 'lucide-react'

const navGroups: {
  id: string
  label: string
  items: { to: string; label: string; icon: LucideIcon }[]
}[] = [
  {
    id: 'chamber',
    label: 'Chamber',
    items: [
      { to: '/dashboard', label: 'Mission Control', icon: LayoutDashboard },
      { to: '/interview', label: 'Interview Chamber', icon: Mic2 },
    ],
  },
  {
    id: 'signal',
    label: 'Signal',
    items: [
      { to: '/debrief', label: 'Knowledge Passport', icon: BarChart3 },
      { to: '/dna', label: 'Candidate DNA', icon: Dna },
      { to: '/knowledge', label: 'Knowledge Graph', icon: Network },
    ],
  },
  {
    id: 'prep',
    label: 'Prep',
    items: [
      { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const location = useLocation()
  const reduce = useReducedMotion()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 272 }}
      transition={reduce ? { duration: 0.15 } : springs.sidebar}
      className="os-rail relative z-30 flex h-full flex-col overflow-hidden border-r"
    >
      <div
        className={cn(
          'flex h-[4.25rem] items-center border-b border-helix-border/60 px-4',
          collapsed && 'justify-center px-2',
        )}
      >
        <div className={cn('flex min-w-0 flex-col', collapsed && 'items-center')}>
          <Logo markOnly={collapsed} />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p
                key="tag"
                initial={reduce ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-0.5 truncate pl-[38px] text-[10px] font-medium tracking-wide text-helix-muted"
              >
                Interview Operating System
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-3" aria-label="Primary">
        {navGroups.map((group) => (
          <div key={group.id}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  key={`${group.id}-label`}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-1.5 px-3 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-helix-muted/80"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname.startsWith(item.to)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      'focus-ring',
                      active
                        ? 'text-helix-signal'
                        : 'text-helix-muted hover:bg-helix-elevated/50 hover:text-helix-text',
                      collapsed && 'justify-center px-2',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl border border-helix-signal/25 bg-helix-signal/10 shadow-[inset_0_0_24px_-8px_rgb(62_224_197_/_0.35)]"
                        transition={springs.snappy}
                      />
                    )}
                    {active && (
                      <motion.span
                        layoutId="sidebar-pip"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-helix-signal"
                        transition={springs.snappy}
                      />
                    )}
                    <item.icon className="relative z-10 h-4 w-4 shrink-0" />
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          key="label"
                          initial={reduce ? false : { opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.18 }}
                          className="relative z-10 truncate font-display"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('border-t border-helix-border/60 p-3', collapsed && 'px-2')}>
        <motion.button
          type="button"
          onClick={onToggle}
          whileHover={reduce ? undefined : { y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-helix-border/70 bg-helix-elevated/30 py-2 text-xs text-helix-muted transition-colors hover:border-helix-signal/30 hover:text-helix-text"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  )
}
