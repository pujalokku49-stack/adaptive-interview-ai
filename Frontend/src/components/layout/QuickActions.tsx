import { Link } from 'react-router-dom'
import { Mic2, BookOpen, Dna, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { revealItem, springs } from '@/lib/motion'

const actions = [
  { to: '/interview', label: 'Start interview', icon: Mic2 },
  { to: '/curriculum', label: 'Continue learning', icon: BookOpen },
  { to: '/dna', label: 'View DNA', icon: Dna },
  { to: '/debrief', label: 'Knowledge Passport', icon: BarChart3 },
]

export function QuickActions({ className }: { className?: string }) {
  return (
    <motion.div
      variants={revealItem}
      className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}
    >
      {actions.map((a, i) => (
        <motion.div
          key={a.to}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={springs.tap}
        >
          <Link
            to={a.to}
            className="group relative flex h-full items-center gap-2.5 overflow-hidden rounded-2xl border border-helix-border/60 bg-helix-surface/40 px-3.5 py-3 text-sm shadow-card backdrop-blur-md transition-colors hover:border-helix-signal/35 hover:shadow-float"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-helix-signal/8 via-transparent to-helix-copper/5 opacity-0 transition group-hover:opacity-100" />
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springs.soft, delay: 0.05 * i }}
              className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-helix-signal/20 bg-helix-signal/10 text-helix-signal"
            >
              <a.icon className="h-4 w-4" />
            </motion.span>
            <span className="relative font-display font-medium">{a.label}</span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
