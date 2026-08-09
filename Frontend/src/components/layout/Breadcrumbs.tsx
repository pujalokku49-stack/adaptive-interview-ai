import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const labels: Record<string, string> = {
  dashboard: 'Mission Control',
  interview: 'Interview Chamber',
  knowledge: 'Knowledge Graph',
  curriculum: 'Curriculum Explorer',
  debrief: 'Knowledge Passport',
  dna: 'Candidate DNA',
  settings: 'Settings',
}

export function Breadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('hidden min-w-0 items-center gap-1.5 md:flex', className)}
    >
      <ol className="flex min-w-0 items-center gap-1.5">
        <li>
          <Link
            to="/dashboard"
            className="focus-ring inline-flex rounded-md p-1 text-helix-muted hover:text-helix-text"
            aria-label="Mission Control home"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </li>
        {segments.map((seg, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/')
          const last = i === segments.length - 1
          return (
            <li key={href} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3 w-3 shrink-0 text-helix-muted/70" aria-hidden />
              {last ? (
                <span
                  className="truncate font-display text-sm font-medium text-helix-text"
                  aria-current="page"
                >
                  {labels[seg] ?? seg}
                </span>
              ) : (
                <Link
                  to={href}
                  className="focus-ring truncate rounded-md px-1 text-sm text-helix-muted hover:text-helix-text"
                >
                  {labels[seg] ?? seg}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
