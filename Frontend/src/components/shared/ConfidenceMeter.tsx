import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

export function ConfidenceMeter({
  value,
  className,
  label = 'Confidence',
  pulse = false,
}: {
  value: number
  className?: string
  label?: string
  /** Flash when confidence mutates after an answer */
  pulse?: boolean
}) {
  const pct = Math.round(value * 100)
  return (
    <motion.div
      className={cn('space-y-2', className)}
      animate={
        pulse
          ? {
              boxShadow: [
                '0 0 0 0 transparent',
                '0 0 28px -8px rgb(62 224 197 / 0.45)',
                '0 0 0 0 transparent',
              ],
            }
          : undefined
      }
      transition={{ duration: 1.2 }}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-helix-muted">{label}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={pct}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              'font-display font-semibold text-helix-signal',
              pulse && 'text-helix-success',
            )}
          >
            {pct}%
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-helix-elevated">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-helix-signal-dim to-helix-signal"
        />
        {pulse && (
          <motion.div
            className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ left: ['-20%', '120%'] }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        )}
      </div>
    </motion.div>
  )
}

export function StrengthMeter({
  label,
  value,
  variant = 'strength',
}: {
  label: string
  value: number
  variant?: 'strength' | 'weakness'
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-helix-muted">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-helix-elevated">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn(
            'h-full rounded-full',
            variant === 'strength' ? 'bg-helix-success' : 'bg-helix-copper',
          )}
        />
      </div>
    </div>
  )
}
