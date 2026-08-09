import { Link } from 'react-router-dom'
import { notifications } from '@/data/mock'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { dropdownVariants, springs } from '@/lib/motion'

export function Notifications({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label="Notifications"
          variants={dropdownVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-helix-border bg-helix-surface shadow-card"
        >
          <div className="flex items-center justify-between border-b border-helix-border px-4 py-3">
            <h3 className="font-display text-sm font-semibold">Notifications</h3>
            <span className="text-xs text-helix-muted">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n, i) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springs.soft, delay: 0.04 * i }}
                className={cn(
                  'border-b border-helix-border/60 px-4 py-3 last:border-0 transition-colors hover:bg-helix-elevated/40',
                  !n.read && 'bg-helix-signal/5',
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <motion.span
                      layoutId={`notif-dot-${n.id}`}
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-helix-copper"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={springs.snappy}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-helix-muted">{n.body}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
          <Link
            to="/settings"
            onClick={onClose}
            className="block border-t border-helix-border px-4 py-2.5 text-center text-xs text-helix-signal transition-colors hover:bg-helix-elevated"
          >
            Notification settings
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
