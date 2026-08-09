import type { ReactNode } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  EmptyState,
  ErrorState,
  OfflineState,
  SuccessState,
} from './AppStates'
import { PageSkeleton, type PageSkeletonKind } from './PageSkeletons'
import type { AppViewState } from '@/hooks/usePageState'

const emptyCopy: Partial<
  Record<
    PageSkeletonKind,
    { title: string; description: string; actionLabel?: string; actionTo?: string }
  >
> = {
  dashboard: {
    title: 'No mission data yet',
    description:
      'Complete your first Interview Chamber session to populate readiness, streaks, and analytics.',
    actionLabel: 'Enter chamber',
    actionTo: '/interview',
  },
  interview: {
    title: 'Chamber is idle',
    description:
      'No active probe in this session. Start answering to wake adaptive systems across the rail.',
    actionLabel: 'Open Mission Control',
    actionTo: '/dashboard',
  },
  knowledge: {
    title: 'No matching nodes',
    description:
      'Adjust filters or clear search — the curriculum constellation will reappear when topics match.',
    actionLabel: 'Reset filters',
  },
  curriculum: {
    title: 'No days match',
    description:
      'Try a broader search or clear the difficulty filter to reveal the 31-day adaptive track.',
    actionLabel: 'Clear filters',
  },
  debrief: {
    title: 'No passport issued',
    description:
      'Finish an Interview Chamber to generate your Knowledge Passport with scores and next mission.',
    actionLabel: 'Start interview',
    actionTo: '/interview',
  },
  dna: {
    title: 'Genome not initialized',
    description:
      'Candidate DNA mutates during live interviews. Enter the chamber to begin writing skill axes.',
    actionLabel: 'Evolve in chamber',
    actionTo: '/interview',
  },
  settings: {
    title: 'Preferences unavailable',
    description: 'Workspace settings could not be loaded for this tenant.',
    actionLabel: 'Back to Mission Control',
    actionTo: '/dashboard',
  },
  landing: {
    title: 'Helix is preparing',
    description: 'Marketing surfaces will appear once the control plane finishes warming up.',
    actionLabel: 'Go to dashboard',
    actionTo: '/dashboard',
  },
}

export function PageStateGate({
  state,
  kind,
  onRetry,
  onEmptyAction,
  children,
  successTitle,
  successDescription,
  successActionLabel,
  successActionTo,
  wrapTransition = true,
}: {
  state: AppViewState
  kind: PageSkeletonKind
  onRetry?: () => void
  onEmptyAction?: () => void
  children: ReactNode
  successTitle?: string
  successDescription?: string
  successActionLabel?: string
  successActionTo?: string
  wrapTransition?: boolean
}) {
  const wrap = (node: ReactNode) =>
    wrapTransition ? <PageTransition>{node}</PageTransition> : node

  if (state === 'loading') {
    return wrap(<PageSkeleton kind={kind} />)
  }

  if (state === 'offline') {
    return wrap(
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <OfflineState onRetry={onRetry} />
      </div>,
    )
  }

  if (state === 'error') {
    return wrap(
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ErrorState
          title="Failed to load this surface"
          description="The control plane returned an unexpected fault. Retry to resynchronize, or return to Mission Control."
          code="HELIX-SYNC"
          onRetry={onRetry}
        />
      </div>,
    )
  }

  if (state === 'empty') {
    const copy = emptyCopy[kind]
    return wrap(
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <EmptyState
          title={copy?.title}
          description={copy?.description}
          actionLabel={copy?.actionLabel}
          actionTo={onEmptyAction ? undefined : copy?.actionTo}
          onAction={onEmptyAction}
        />
      </div>,
    )
  }

  if (state === 'success') {
    return wrap(
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <SuccessState
          title={successTitle ?? 'Synchronized'}
          description={
            successDescription ??
            'Changes are live across Helix. Continue to the next surface when ready.'
          }
          actionLabel={successActionLabel ?? 'Continue'}
          actionTo={successActionTo ?? '/dashboard'}
        />
      </div>,
    )
  }

  return <>{children}</>
}
