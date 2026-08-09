import { cn } from '@/lib/utils'
import type { Difficulty } from '@/types'

const styles: Record<Difficulty, string> = {
  easy: 'bg-helix-success/15 text-helix-success border-helix-success/35',
  medium: 'bg-helix-signal/15 text-helix-signal border-helix-signal/35',
  hard: 'bg-helix-copper/15 text-helix-copper border-helix-copper/35',
  expert: 'bg-helix-danger/15 text-helix-danger border-helix-danger/35',
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide',
        styles[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  )
}

export function TopicBadge({
  topic,
  className,
}: {
  topic: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-helix-border bg-helix-elevated/70 px-2 py-0.5 text-xs font-medium text-helix-text/75',
        className,
      )}
    >
      {topic}
    </span>
  )
}
