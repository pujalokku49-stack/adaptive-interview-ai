import { motion, type Transition, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Subtle enterprise springs — prefer over long easings */
export const springs = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const,
  soft: { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 } as const,
  gentle: { type: 'spring', stiffness: 220, damping: 26, mass: 1 } as const,
  sidebar: { type: 'spring', stiffness: 320, damping: 36, mass: 0.85 } as const,
  page: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const,
  tap: { type: 'spring', stiffness: 500, damping: 28, mass: 0.6 } as const,
}

export const easings = {
  out: [0.22, 1, 0.36, 1] as const,
}

export const pageTransition: Transition = {
  ...springs.page,
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: pageTransition,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: easings.out },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: springs.soft,
  },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
}

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.12 },
  },
}

/** Scroll / mount reveal — once by default */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-32px' }}
      transition={{ ...springs.soft, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Stagger children that use `revealItem` variants */
export function Stagger({
  children,
  className,
  faster = false,
}: {
  children: ReactNode
  className?: string
  faster?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: faster ? 0.035 : 0.055,
            delayChildren: 0.03,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={cn(className)} variants={revealItem}>
      {children}
    </motion.div>
  )
}

/** Shared-element friendly layout id wrapper */
export function SharedSurface({
  layoutId,
  children,
  className,
}: {
  layoutId: string
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={springs.soft}
    >
      {children}
    </motion.div>
  )
}
