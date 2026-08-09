import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/layout/Logo'
import { ErrorIllustration } from '@/components/states'
import { springs } from '@/lib/motion'
import { RefreshCw } from 'lucide-react'

/** Full-page elegant error surface — route: /error */
export function ErrorPage() {
  const retry = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-helix-bg px-4">
      <div className="pointer-events-none absolute inset-0 os-atmosphere" />
      <div className="pointer-events-none absolute inset-0 neural-mesh opacity-60" />
      <Logo />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.soft}
        className="panel-float relative z-10 w-full max-w-md p-8 text-center"
      >
        <div className="relative z-[1] flex flex-col items-center">
          <ErrorIllustration className="mb-4 max-w-[180px]" />
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-helix-danger">
            Critical fault · HELIX-500
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">Control plane interrupted</h1>
          <p className="mt-2 text-sm leading-relaxed text-helix-muted">
            An unexpected error stopped this surface. Your interview memory and DNA remain intact.
            Retry synchronization or return to Mission Control.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button onClick={retry}>
              <RefreshCw className="h-4 w-4" /> Retry sync
            </Button>
            <Link to="/dashboard">
              <Button variant="secondary">Mission Control</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
