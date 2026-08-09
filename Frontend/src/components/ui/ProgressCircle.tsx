import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/motion'

interface ProgressCircleProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
  color?: string
}

export function ProgressCircle({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  className,
  color = 'var(--color-helix-signal)',
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useMotionValue(0)
  const dash = useTransform(progress, (v) => circumference - (v / 100) * circumference)
  const reduce = useReducedMotion()

  useEffect(() => {
    const controls = animate(progress, Math.min(100, Math.max(0, value)), {
      ...(reduce
        ? { duration: 0 }
        : { type: 'spring', stiffness: 90, damping: 22, mass: 0.8 }),
    })
    return controls.stop
  }, [value, progress, reduce])

  return (
    <motion.div
      className={cn('relative inline-flex items-center justify-center', className)}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.soft}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-helix-border"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dash }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Counter value={value} className="font-display text-lg font-bold" />
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-helix-muted">{label}</span>
        )}
      </div>
    </motion.div>
  )
}

export function Counter({
  value,
  className,
  suffix = '',
  decimals = 0,
}: {
  value: number
  className?: string
  suffix?: string
  decimals?: number
}) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : `${Math.round(v)}`
    return `${n}${suffix}`
  })
  const reduce = useReducedMotion()

  useEffect(() => {
    const controls = animate(mv, value, {
      ...(reduce
        ? { duration: 0 }
        : { type: 'spring', stiffness: 80, damping: 20, mass: 0.85 }),
    })
    return controls.stop
  }, [value, mv, reduce])

  return <motion.span className={className}>{rounded}</motion.span>
}
