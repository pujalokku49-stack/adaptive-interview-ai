import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/layout/Logo'
import { EmptyIllustration } from '@/components/states'
import { springs } from '@/lib/motion'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-helix-bg px-4">
      <div className="pointer-events-none absolute inset-0 os-atmosphere" />
      <div className="pointer-events-none absolute inset-0 neural-mesh opacity-70" />
      <Logo />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.soft}
        className="panel-float relative z-10 max-w-md p-8 text-center"
      >
        <div className="relative z-[1] flex flex-col items-center">
          <EmptyIllustration className="mb-2 max-w-[180px]" />
          <p className="font-display text-7xl font-extrabold text-helix-signal/35">404</p>
          <h1 className="mt-1 font-display text-2xl font-bold">Signal lost</h1>
          <p className="mt-2 text-sm leading-relaxed text-helix-muted">
            This route isn’t on the knowledge graph. Return to Mission Control to reorient, or open
            the Interview Chamber to generate new signal.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link to="/dashboard">
              <Button>Mission Control</Button>
            </Link>
            <Link to="/interview">
              <Button variant="secondary">Interview Chamber</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
