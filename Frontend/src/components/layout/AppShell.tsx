import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutlet, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { CommandPalette } from './CommandPalette'
import { FloatingAIAssistant } from './FloatingAIAssistant'
import { Drawer } from '@/components/ui/Drawer'
import {
  LayoutDashboard,
  Mic2,
  Network,
  BookOpen,
  BarChart3,
  Dna,
  Settings,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Logo } from './Logo'
import { OsAtmosphere } from '@/components/os/OsAtmosphere'
import { OfflineBanner } from '@/components/states'
import { useOnlineStatus } from '@/hooks/usePageState'

const mobileNav = [
  { to: '/dashboard', label: 'Mission Control', icon: LayoutDashboard },
  { to: '/interview', label: 'Interview Chamber', icon: Mic2 },
  { to: '/knowledge', label: 'Knowledge Graph', icon: Network },
  { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { to: '/debrief', label: 'Knowledge Passport', icon: BarChart3 },
  { to: '/dna', label: 'Candidate DNA', icon: Dna },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()
  const { toggleTheme } = useTheme()
  const online = useOnlineStatus()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        toggleTheme()
      }
      if (meta && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        navigate('/interview')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, toggleTheme])

  return (
    <div className="relative flex h-svh overflow-hidden bg-helix-bg">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <OsAtmosphere />

      <div className="relative z-10 hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Navbar
          onOpenCommand={() => setCommandOpen(true)}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <AnimatePresence>
          {!online && <OfflineBanner onRetry={() => window.location.reload()} />}
        </AnimatePresence>
        <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-y-auto outline-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <FloatingAIAssistant />

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Navigate" side="left">
        <div className="mb-6">
          <Logo />
        </div>
        <nav className="space-y-1">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-helix-signal/10 text-helix-signal'
                    : 'text-helix-muted hover:bg-helix-elevated'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="font-display">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </Drawer>
    </div>
  )
}
