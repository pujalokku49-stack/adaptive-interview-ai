import { Link } from 'react-router-dom'
import { DifficultyBadge, TopicBadge } from '@/components/ui/Badge'
import { CandidateAvatar } from './Avatars'
import type { Candidate, InterviewSession } from '@/types'
import { formatDuration, cn } from '@/lib/utils'
import { StrengthMeter } from './ConfidenceMeter'

/** Identity block for DNA — not a generic clickable card */
export function CandidateIdentity({
  candidate,
  readiness,
}: {
  candidate: Candidate
  readiness?: number
}) {
  const ready = readiness ?? candidate.readiness
  return (
    <div className="flex items-center gap-4">
      <CandidateAvatar name={candidate.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-semibold">{candidate.name}</p>
        <p className="truncate text-sm text-helix-muted">
          {candidate.role}
          {candidate.company ? ` · ${candidate.company}` : ''}
        </p>
        <div className="mt-2 max-w-[200px]">
          <StrengthMeter label="Readiness" value={ready} variant="strength" />
        </div>
      </div>
    </div>
  )
}

/** @deprecated Prefer CandidateIdentity — kept for compatibility */
export function CandidateCard({
  candidate,
  onClick,
}: {
  candidate: Candidate
  onClick?: () => void
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'rounded-2xl border border-helix-border/60 bg-helix-surface/40 p-5',
        onClick && 'focus-ring cursor-pointer hover:border-helix-signal/30',
      )}
    >
      <CandidateIdentity candidate={candidate} />
    </div>
  )
}

/** Pull-quote style feedback — large score numeral */
export function FeedbackCard({
  title,
  body,
  score,
}: {
  title: string
  body: string
  score?: number
}) {
  return (
    <div className="border-l-2 border-helix-signal/40 pl-4 py-1">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-sm font-semibold">{title}</h4>
        {score !== undefined && (
          <span className="font-display text-2xl font-bold tabular-nums text-helix-signal">
            {score}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-helix-muted">{body}</p>
    </div>
  )
}

/** Timeline-style session row for Mission Control lists */
export function InterviewSessionRow({ session }: { session: InterviewSession }) {
  return (
    <li>
      <Link
        to={session.status === 'scheduled' ? '/interview' : '/debrief'}
        className="focus-ring flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-helix-elevated/35"
      >
        {session.score !== undefined ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-helix-signal/30 bg-helix-signal/10 font-display text-sm font-bold text-helix-signal">
            {session.score}
          </span>
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-helix-border text-[10px] font-semibold uppercase text-helix-muted">
            Soon
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold">{session.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={session.difficulty} />
            <TopicBadge topic={session.topic} />
          </div>
        </div>
        <p className="hidden shrink-0 text-xs text-helix-muted sm:block">
          {new Date(session.scheduledAt).toLocaleDateString()} ·{' '}
          {formatDuration(session.durationSec)}
        </p>
      </Link>
    </li>
  )
}

/** @deprecated Prefer InterviewSessionRow */
export function InterviewSessionCard({ session }: { session: InterviewSession }) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-helix-border/60">
      <InterviewSessionRow session={session} />
    </ul>
  )
}
