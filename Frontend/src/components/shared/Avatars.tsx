import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

export function AIAvatar({
  size = 'md',
  thinking = false,
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  thinking?: boolean
  className?: string
}) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }
  const icons = { sm: 'h-3.5 w-3.5', md: 'h-4.5 w-4.5', lg: 'h-6 w-6' }

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-helix-signal to-helix-signal-dim text-helix-bg',
        sizes[size],
        className,
      )}
    >
      <Bot className={icons[size]} />
      {thinking && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-helix-copper opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-helix-copper" />
        </span>
      )}
    </div>
  )
}

export function CandidateAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-helix-copper to-helix-copper-dim font-display font-semibold text-helix-bg',
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials || <User className="h-4 w-4" />}
    </div>
  )
}
