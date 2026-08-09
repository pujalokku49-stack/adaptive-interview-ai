import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/motion'
import {
  EmptyIllustration,
  ErrorIllustration,
  OfflineIllustration,
  SuccessIllustration,
} from './StateIllustrations'
import { WifiOff, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type Tone = 'signal' | 'copper' | 'danger' | 'success'

const toneBorder: Record<Tone, string> = {
  signal: 'border-helix-signal/25',
  copper: 'border-helix-copper/30',
  danger: 'border-helix-danger/30',
  success: 'border-helix-success/30',
}

function StateShell({
  children,
  className,
  tone = 'signal',
  compact = false,
}: {
  children: ReactNode
  className?: string
  tone?: Tone
  compact?: boolean
}) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.soft}
      className={cn(
        'relative mx-auto flex w-full flex-col items-center overflow-hidden rounded-2xl border bg-helix-surface/50 text-center shadow-card backdrop-blur-xl',
        toneBorder[tone],
        compact ? 'max-w-lg px-6 py-8' : 'max-w-xl px-8 py-12',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-helix-signal)_10%,transparent),transparent_60%)]" />
      <div className="relative z-[1] flex w-full flex-col items-center">{children}</div>
    </motion.div>
  )
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'When signal arrives, this surface will fill with live data.',
  actionLabel,
  onAction,
  actionTo,
  className,
  compact,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionTo?: string
  className?: string
  compact?: boolean
}) {
  return (
    <StateShell className={className} tone="copper" compact={compact}>
      <EmptyIllustration className="mb-6" />
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-helix-copper">
        Empty orbit
      </p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-helix-muted">{description}</p>
      {(actionLabel && onAction) || (actionLabel && actionTo) ? (
        <div className="mt-6">
          {actionTo ? (
            <Link to={actionTo}>
              <Button variant="copper">
                {actionLabel} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="copper" onClick={onAction}>
              {actionLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}
    </StateShell>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Helix couldn’t complete this request. Your workspace is safe — retry when ready.',
  onRetry,
  secondaryLabel,
  secondaryTo = '/dashboard',
  className,
  compact,
  code,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  secondaryLabel?: string
  secondaryTo?: string
  className?: string
  compact?: boolean
  code?: string
}) {
  return (
    <StateShell className={className} tone="danger" compact={compact}>
      <ErrorIllustration className="mb-6" />
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-helix-danger">
        Signal fault{code ? ` · ${code}` : ''}
      </p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-helix-muted">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        )}
        {secondaryLabel !== null && (
          <Link to={secondaryTo}>
            <Button variant="secondary">{secondaryLabel ?? 'Mission Control'}</Button>
          </Link>
        )}
      </div>
    </StateShell>
  )
}

export function OfflineState({
  title = 'You’re offline',
  description = 'Helix needs a connection to sync chambers, DNA, and curriculum. Reconnect to resume.',
  onRetry,
  className,
  compact,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  compact?: boolean
}) {
  return (
    <StateShell className={className} tone="copper" compact={compact}>
      <OfflineIllustration className="mb-6" />
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-helix-copper/30 bg-helix-copper/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-helix-copper">
        <WifiOff className="h-3.5 w-3.5" /> Offline
      </div>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-helix-muted">{description}</p>
      {onRetry && (
        <Button variant="copper" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Check connection
        </Button>
      )}
    </StateShell>
  )
}

export function SuccessState({
  title = 'All systems go',
  description = 'Your action completed successfully. Helix has synchronized the change.',
  actionLabel,
  actionTo,
  onAction,
  className,
  compact,
}: {
  title?: string
  description?: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  className?: string
  compact?: boolean
}) {
  return (
    <StateShell className={className} tone="success" compact={compact}>
      <SuccessIllustration className="mb-6" />
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-helix-success/30 bg-helix-success/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-helix-success">
        <CheckCircle2 className="h-3.5 w-3.5" /> Success
      </div>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-helix-muted">{description}</p>
      {(actionLabel && actionTo) || (actionLabel && onAction) ? (
        <div className="mt-6">
          {actionTo ? (
            <Link to={actionTo}>
              <Button>
                {actionLabel} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button onClick={onAction}>
              {actionLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}
    </StateShell>
  )
}

/** Slim offline strip for app chrome */
export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-b border-helix-copper/30 bg-helix-copper/10"
    >
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-sm">
        <WifiOff className="h-4 w-4 text-helix-copper" />
        <span className="text-helix-text">
          You’re offline — live sync paused until connection returns.
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="font-display text-xs font-semibold text-helix-copper underline-offset-2 hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    </motion.div>
  )
}

/** Compact inline success toast-style panel */
export function SuccessBanner({
  title,
  description,
  onDismiss,
}: {
  title: string
  description?: string
  onDismiss?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-start gap-3 rounded-xl border border-helix-success/30 bg-helix-success/10 px-4 py-3"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-helix-success" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-xs text-helix-muted">{description}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-helix-muted hover:text-helix-text"
        >
          Dismiss
        </button>
      )}
    </motion.div>
  )
}
