import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'
import { springs } from '@/lib/motion'

type Elevation = 'base' | 'float' | 'inset'

interface AdaptivePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  children: ReactNode
  elevation?: Elevation
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  accent?: 'signal' | 'copper' | 'none'
  /** Opt into staggered card reveal when inside MissionFrame */
  reveal?: boolean
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

/** Floating / layered Mission Control panel with spring hover elevation */
export function AdaptivePanel({
  children,
  className,
  elevation = 'base',
  hover = false,
  glow = false,
  padding = 'md',
  accent = 'none',
  reveal = false,
  ...props
}: AdaptivePanelProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      layout={false}
      initial={reveal && !reduce ? { opacity: 0, y: 12 } : false}
      whileInView={reveal && !reduce ? { opacity: 1, y: 0 } : undefined}
      viewport={reveal ? { once: true, margin: '-24px' } : undefined}
      whileHover={
        hover && !reduce
          ? {
              y: -4,
              transition: springs.soft,
            }
          : undefined
      }
      whileTap={hover && !reduce ? { scale: 0.995, transition: springs.tap } : undefined}
      transition={springs.soft}
      className={cn(
        'relative z-0 will-change-transform',
        elevation === 'base' && 'panel-adaptive',
        elevation === 'float' && 'panel-float',
        elevation === 'inset' && 'panel-inset',
        hover &&
          'cursor-pointer hover:border-helix-signal/30 hover:shadow-[var(--shadow-float)]',
        glow && 'border-helix-signal/20 shadow-glow',
        accent === 'signal' && 'before:!opacity-100',
        accent === 'copper' &&
          '[&::before]:bg-[linear-gradient(125deg,rgb(232_168_124_/_0.1)_0%,transparent_42%,rgb(62_224_197_/_0.04)_100%)]',
        paddings[padding],
        className,
      )}
      {...props}
    >
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
