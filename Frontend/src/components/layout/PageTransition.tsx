import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { pageVariants, staggerContainer, revealItem } from '@/lib/motion'

export function PageTransition({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      variants={reduce ? undefined : pageVariants}
      initial={reduce ? false : 'initial'}
      animate={reduce ? undefined : 'animate'}
      exit={reduce ? undefined : 'exit'}
      className={cn('relative will-change-transform', className)}
    >
      {children}
    </motion.div>
  )
}

/** Premium enterprise content frame used across Mission Control pages */
export function MissionFrame({
  children,
  className,
  wide = false,
  stagger = true,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
  stagger?: boolean
}) {
  const reduce = useReducedMotion()

  if (!stagger || reduce) {
    return (
      <div
        className={cn(
          'relative mx-auto flex flex-col space-y-7 p-4 sm:p-6 md:space-y-8 md:p-8 lg:p-10',
          wide ? 'max-w-[92rem]' : 'max-w-7xl',
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        'relative mx-auto flex flex-col space-y-7 p-4 sm:p-6 md:space-y-8 md:p-8 lg:p-10',
        wide ? 'max-w-[92rem]' : 'max-w-7xl',
        className,
      )}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

/** Wrap any MissionFrame section for staggered card reveal */
export function MissionSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={revealItem}>
      {children}
    </motion.div>
  )
}

export function MissionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <motion.div
      variants={revealItem}
      className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="max-w-2xl">
        <p className="font-display text-xs font-semibold tracking-wide text-helix-signal">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-helix-text sm:text-3xl md:text-[2rem] md:leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-helix-muted md:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </motion.div>
  )
}

/** Compact title row — Settings, secondary tools */
export function CompactHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <motion.div
      variants={revealItem}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-helix-muted">{description}</p>
        )}
      </div>
      {actions}
    </motion.div>
  )
}

/** Credential / identity bar for Passport & DNA */
export function IdentityBar({
  label,
  title,
  meta,
  actions,
}: {
  label: string
  title: string
  meta?: string
  actions?: ReactNode
}) {
  return (
    <motion.div
      variants={revealItem}
      className="flex flex-col gap-4 border-b border-helix-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <p className="font-display text-xs font-semibold tracking-wide text-helix-copper">
          {label}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {meta && <p className="mt-1.5 text-sm text-helix-muted">{meta}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  )
}

export function KeyboardShortcutsHint() {
  return (
    <div className="panel-adaptive p-5 text-sm">
      <p className="relative z-[1] font-display font-semibold">Keyboard shortcuts</p>
      <ul className="relative z-[1] mt-3 space-y-2 text-helix-muted">
        <li className="flex justify-between">
          <span>Command palette</span>
          <kbd className="rounded border border-helix-border px-1.5 py-0.5 text-xs">⌘K</kbd>
        </li>
        <li className="flex justify-between">
          <span>Toggle theme</span>
          <kbd className="rounded border border-helix-border px-1.5 py-0.5 text-xs">⌘D</kbd>
        </li>
        <li className="flex justify-between">
          <span>Start interview</span>
          <kbd className="rounded border border-helix-border px-1.5 py-0.5 text-xs">⌘I</kbd>
        </li>
      </ul>
    </div>
  )
}
