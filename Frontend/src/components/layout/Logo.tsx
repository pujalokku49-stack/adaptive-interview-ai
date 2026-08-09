import { cn } from '@/lib/utils'

export function Logo({
  className,
  markOnly = false,
}: {
  className?: string
  markOnly?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-helix-elevated" />
        <path
          d="M10 8c4 4 4 12 0 16"
          stroke="#3EE0C5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M22 8c-4 4-4 12 0 16"
          stroke="#E8A87C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2.5" fill="#3EE0C5" />
      </svg>
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-tight">
          Helix
        </span>
      )}
    </div>
  )
}
