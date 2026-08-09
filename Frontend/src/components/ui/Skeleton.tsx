import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { revealItem, springs } from '@/lib/motion'

export function Skeleton({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ ...springs.gentle, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl bg-helix-elevated/80',
        className,
      )}
    >
      <div className="absolute inset-0 shimmer" aria-hidden />
      <div className="absolute inset-0 shimmer-sheen" aria-hidden />
    </motion.div>
  )
}

export function LoadingSkeleton() {
  return (
    <motion.div
      className="space-y-4 p-6"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.07, delayChildren: 0.04 },
        },
      }}
      initial="hidden"
      animate="show"
      role="status"
      aria-label="Loading"
    >
      <motion.div variants={revealItem}>
        <Skeleton className="h-8 w-48" />
      </motion.div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} variants={revealItem}>
            <Skeleton className="h-28" delay={i * 0.05} />
          </motion.div>
        ))}
      </div>
      <motion.div variants={revealItem}>
        <Skeleton className="h-64" />
      </motion.div>
    </motion.div>
  )
}
