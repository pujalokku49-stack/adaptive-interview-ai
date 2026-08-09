import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Shared cognition pulse — replaces spinners across Helix OS */
export function ThinkingPulse({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-1', className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-helix-signal"
          animate={{
            height: [4, 14, 4],
            opacity: [0.35, 1, 0.35],
          }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            delay: i * 0.09,
            ease: 'easeInOut',
          }}
          style={{ height: 4 }}
        />
      ))}
    </div>
  )
}
