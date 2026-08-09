import { cn } from '@/lib/utils'
import { Search as SearchIcon } from 'lucide-react'

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export function Search({ className, id, ...props }: SearchProps) {
  const inputId = id ?? 'search-input'
  return (
    <div className={cn('relative', className)}>
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-helix-muted"
        aria-hidden
      />
      <label htmlFor={inputId} className="sr-only">
        {props['aria-label'] ?? props.placeholder ?? 'Search'}
      </label>
      <input
        id={inputId}
        type="search"
        className="h-10 min-h-10 w-full rounded-xl border border-helix-border bg-helix-elevated/55 py-2 pl-9 pr-3 text-sm text-helix-text outline-none transition placeholder:text-helix-muted/90 focus-visible:border-helix-signal/55 focus-visible:ring-2 focus-visible:ring-helix-signal/25"
        {...props}
      />
    </div>
  )
}
