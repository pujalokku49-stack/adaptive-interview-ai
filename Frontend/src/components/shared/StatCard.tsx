import { motion } from 'framer-motion'
import { TrendingUp, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Counter } from '@/components/ui/ProgressCircle'
import { revealItem, springs } from '@/lib/motion'

export function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon = TrendingUp,
  trend,
  className,
}: {
  label: string
  value: number
  suffix?: string
  icon?: LucideIcon
  trend?: string
  className?: string
}) {
  return (
    <motion.div variants={revealItem} className={className}>
      <Card hover elevation="float" className="relative h-full overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-helix-signal/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-6 h-20 w-20 rounded-full bg-helix-copper/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-helix-muted">
              {label}
            </p>
            <p className="mt-2.5 font-display text-3xl font-bold tracking-tight">
              <Counter value={value} suffix={suffix} />
            </p>
            {trend && <p className="mt-1.5 text-xs text-helix-success">{trend}</p>}
          </div>
          <motion.div
            whileHover={{ scale: 1.06, rotate: -3 }}
            transition={springs.tap}
            className="rounded-xl border border-helix-signal/20 bg-helix-signal/10 p-2.5 text-helix-signal shadow-[0_0_20px_-6px_rgb(62_224_197_/_0.5)]"
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  index = 0,
}: {
  title: string
  description: string
  icon: LucideIcon
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.soft, delay: index * 0.08 }}
    >
      <Card hover elevation="float" className="h-full">
        <div className="mb-4 inline-flex rounded-xl border border-helix-signal/20 bg-helix-elevated/60 p-3 text-helix-signal">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-helix-muted">{description}</p>
      </Card>
    </motion.div>
  )
}
