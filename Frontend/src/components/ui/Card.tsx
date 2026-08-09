import { AdaptivePanel } from '@/components/os/AdaptivePanel'
import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  elevation?: 'base' | 'float' | 'inset'
  accent?: 'signal' | 'copper' | 'none'
  /** Scroll-triggered card reveal */
  reveal?: boolean
}

export function Card({
  children,
  className,
  hover = false,
  glow = false,
  padding = 'md',
  elevation = 'base',
  accent = 'none',
  reveal = false,
  ...props
}: CardProps) {
  return (
    <AdaptivePanel
      elevation={elevation}
      hover={hover}
      glow={glow}
      padding={padding}
      accent={accent}
      reveal={reveal}
      className={className}
      {...props}
    >
      {children}
    </AdaptivePanel>
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div>
        <h3 className="font-display text-base font-semibold tracking-tight text-helix-text">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-helix-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
