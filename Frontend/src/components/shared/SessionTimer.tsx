import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDuration, cn } from '@/lib/utils'
import { Timer } from 'lucide-react'

export function SessionTimer({
  initialSeconds = 0,
  running = true,
  className,
}: {
  initialSeconds?: number
  running?: boolean
  className?: string
}) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-helix-border bg-helix-elevated/60 px-3 py-1.5 font-display text-sm tabular-nums',
        className,
      )}
    >
      <Timer className="h-3.5 w-3.5 text-helix-signal" />
      {formatDuration(seconds)}
    </div>
  )
}

export function InterviewProgress({
  current,
  total,
  className,
  pulse = false,
}: {
  current: number
  total: number
  className?: string
  pulse?: boolean
}) {
  const pct = Math.min(100, (current / total) * 100)
  return (
    <motion.div
      className={cn('space-y-1.5', className)}
      animate={pulse ? { scale: [1, 1.01, 1] } : undefined}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between text-xs text-helix-muted">
        <span>
          Question {current} of {total}
        </span>
        <motion.span
          key={Math.round(pct)}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className={cn('font-display font-semibold', pulse && 'text-helix-copper')}
        >
          {Math.round(pct)}%
        </motion.span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-helix-elevated">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-helix-copper-dim to-helix-copper"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        />
        {pulse && (
          <motion.div
            className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ left: ['-15%', '110%'] }}
            transition={{ duration: 0.85 }}
          />
        )}
      </div>
    </motion.div>
  )
}
