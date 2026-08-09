import { Bell, Command, Menu, Activity } from 'lucide-react'
import { DarkModeToggle } from '@/components/ui/DarkModeToggle'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from './Breadcrumbs'
import { ProfileMenu } from './ProfileMenu'
import { Notifications } from './Notifications'
import { useState } from 'react'

export function Navbar({
  onOpenCommand,
  onOpenMobileNav,
}: {
  onOpenCommand: () => void
  onOpenMobileNav?: () => void
}) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="os-topbar sticky top-0 z-20 border-b">
      <div className="relative flex h-16 items-center gap-3 px-4 md:h-[4.25rem] md:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden !px-2"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>

        <div className="hidden items-center gap-2 sm:flex" aria-live="polite">
          <span className="status-chip">
            <Activity className="h-3.5 w-3.5" aria-hidden />
            Live
          </span>
        </div>

        <Breadcrumbs />

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCommand}
            className="hidden items-center gap-2 border-helix-border/70 bg-helix-elevated/40 sm:inline-flex"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Command className="h-3.5 w-3.5" aria-hidden />
            <span className="text-helix-muted">Command</span>
            <kbd className="rounded border border-helix-border/80 px-1.5 py-0.5 text-[10px] text-helix-muted">
              ⌘K
            </kbd>
          </Button>
          <DarkModeToggle />
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative !px-2"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              aria-expanded={notifOpen}
              aria-haspopup="dialog"
            >
              <Bell className="h-4 w-4" aria-hidden />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-helix-copper" aria-hidden />
            </Button>
            <Notifications open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
