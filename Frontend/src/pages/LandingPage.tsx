import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BrainCircuit,
  Fingerprint,
  Gauge,
  Network,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/layout/Logo'
import { DarkModeToggle } from '@/components/ui/DarkModeToggle'
import { Accordion } from '@/components/ui/Accordion'
import { faqs, testimonials } from '@/data/mock'
import { InteractiveIllustration, NeuralNetworkBackground } from '@/components/landing/HeroVisuals'
import type { LucideIcon } from 'lucide-react'

const capabilities: {
  title: string
  description: string
  icon: LucideIcon
  accent: string
}[] = [
  {
    title: 'Adaptive Interview Chamber',
    description:
      'Probes tighten or open in real time based on confidence, recovery, and tradeoff quality — not a fixed script.',
    icon: BrainCircuit,
    accent: 'text-helix-signal',
  },
  {
    title: 'Transparent Reasoning',
    description:
      'Every follow-up is explained in a live reasoning panel so panels and candidates share the same signal.',
    icon: Sparkles,
    accent: 'text-helix-copper',
  },
  {
    title: 'Candidate DNA',
    description:
      'A living skill genome across twelve domains — mutated after every chamber answer, not a static scorecard.',
    icon: Fingerprint,
    accent: 'text-helix-signal',
  },
  {
    title: 'Knowledge Heatmap',
    description:
      'See which nodes are strong, brittle, or untested — then route curriculum where it compounds.',
    icon: Network,
    accent: 'text-helix-copper',
  },
  {
    title: 'Mission Readiness',
    description:
      'A single readiness score for hiring bars and internal mobility, calibrated to your rubric.',
    icon: Gauge,
    accent: 'text-helix-signal',
  },
  {
    title: 'Enterprise Trust',
    description:
      'SSO, audit trails, isolated workspaces, and retention controls built for regulated teams.',
    icon: ShieldCheck,
    accent: 'text-helix-copper',
  },
]

const surfaces = [
  {
    title: 'Mission Control',
    blurb: 'Readiness hero, week intensity, chamber queue',
    to: '/dashboard',
    preview: 'mission' as const,
  },
  {
    title: 'Interview Chamber',
    blurb: 'Adaptive chat with cognition rail',
    to: '/interview',
    preview: 'chamber' as const,
  },
  {
    title: 'Knowledge Graph',
    blurb: 'Mastery constellation + inspector',
    to: '/knowledge',
    preview: 'graph' as const,
  },
  {
    title: 'Candidate DNA',
    blurb: 'Twelve-domain living genome',
    to: '/dna',
    preview: 'dna' as const,
  },
]

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-helix-bg text-helix-text">
      <div className="pointer-events-none absolute inset-0 os-atmosphere" />
      <header className="os-topbar relative z-20 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-helix-muted md:flex">
            <a href="#features" className="hover:text-helix-text">
              Product
            </a>
            <a href="#proof" className="hover:text-helix-text">
              Proof
            </a>
            <a href="#faq" className="hover:text-helix-text">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Link to="/dashboard">
              <Button size="sm">Enter OS</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 neural-mesh opacity-80" />
        <div className="absolute inset-0 opacity-55">
          <NeuralNetworkBackground />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24 lg:py-28">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl font-extrabold tracking-tight text-balance md:text-6xl lg:text-7xl"
            >
              Helix
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-5 max-w-md font-display text-xl font-medium text-helix-text/90 md:text-2xl"
            >
              Interview intelligence that adapts mid-conversation.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="mt-4 max-w-md text-base leading-relaxed text-helix-muted"
            >
              Enterprise AI interviews with live reasoning, Candidate DNA, and a 31-day curriculum —
              built for teams who hire for signal, not theater.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/dashboard">
                <Button size="lg">
                  Enter Mission Control
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/interview">
                <Button size="lg" variant="secondary">
                  Launch chamber
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <InteractiveIllustration />
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="max-w-xl">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-helix-signal">
            Capabilities
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Designed for intelligence, adaptivity, and trust.
          </h2>
          <p className="mt-3 text-helix-muted">
            One product surface for interviewers, candidates, and talent leaders — no bolted-on quiz
            bots.
          </p>
        </div>

        <ol className="mt-14 space-y-0 divide-y divide-helix-border/50 border-y border-helix-border/50">
          {capabilities.map((f, i) => (
            <motion.li
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start"
            >
              <span className="font-display text-2xl font-bold tabular-nums text-helix-muted/40">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <f.icon className={`h-4 w-4 shrink-0 ${f.accent}`} aria-hidden />
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-helix-muted">
                  {f.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="border-y border-helix-border bg-helix-surface/40 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-helix-copper">
            Showcase
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold">Surfaces that feel alive</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {surfaces.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-helix-border/70 bg-helix-bg"
              >
                <SurfacePreview kind={card.preview} />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-semibold">{card.title}</h3>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-helix-muted">
                    {card.blurb}
                  </p>
                  <Link
                    to={card.to}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-helix-signal group-hover:underline"
                  >
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="font-display text-3xl font-bold">Trusted by teams who hire for signal</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border-l-2 border-helix-signal/35 pl-5"
            >
              <p className="text-sm leading-relaxed text-helix-text/90">“{t.quote}”</p>
              <footer className="mt-4">
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-helix-muted">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="mb-8 text-center font-display text-3xl font-bold">FAQ</h2>
        <Accordion
          items={faqs.map((f, i) => ({
            id: `faq-${i}`,
            title: f.q,
            content: f.a,
          }))}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-helix-signal/20 bg-gradient-to-br from-helix-surface via-helix-elevated to-helix-bg p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-helix-signal)_12%,transparent),transparent_55%)]" />
          <h2 className="relative font-display text-3xl font-bold md:text-4xl">
            Ready to replace static interviews?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-helix-muted">
            Open Mission Control and run your first adaptive chamber in minutes.
          </p>
          <Link to="/dashboard" className="relative mt-8 inline-block">
            <Button size="lg" variant="copper">
              Start with Helix
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-helix-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-helix-muted md:flex-row md:px-6">
          <Logo />
          <p>© 2026 Helix Labs. Adaptive interview intelligence.</p>
          <div className="flex gap-4">
            <Link to="/dashboard" className="hover:text-helix-text">
              App
            </Link>
            <a href="#faq" className="hover:text-helix-text">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SurfacePreview({
  kind,
}: {
  kind: 'mission' | 'chamber' | 'graph' | 'dna'
}) {
  return (
    <div
      className="relative h-28 overflow-hidden border-b border-helix-border/50 bg-helix-elevated/40"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklab,var(--color-helix-signal)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_80%_80%,color-mix(in_oklab,var(--color-helix-copper)_14%,transparent),transparent_50%)]" />
      {kind === 'mission' && (
        <div className="absolute inset-3 flex items-end gap-2">
          <div className="h-16 w-16 rounded-full border-2 border-helix-copper/50 border-t-helix-copper" />
          <div className="mb-1 flex-1 space-y-1.5">
            <div className="h-2 w-3/4 rounded bg-helix-text/15" />
            <div className="h-2 w-1/2 rounded bg-helix-text/10" />
            <div className="flex gap-1 pt-1">
              {[40, 70, 55, 85, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm bg-helix-signal/40"
                  style={{ height: `${h * 0.2}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {kind === 'chamber' && (
        <div className="absolute inset-3 flex gap-2">
          <div className="flex flex-1 flex-col justify-end gap-1.5">
            <div className="ml-auto h-6 w-[70%] rounded-lg bg-helix-signal/20" />
            <div className="h-8 w-[85%] rounded-lg bg-helix-text/10" />
            <div className="ml-auto h-5 w-[55%] rounded-lg bg-helix-signal/15" />
          </div>
          <div className="flex w-14 flex-col gap-1 rounded-lg border border-helix-border/60 bg-helix-bg/50 p-1.5">
            <div className="h-1.5 rounded bg-helix-signal/50" />
            <div className="h-1.5 rounded bg-helix-copper/40" />
            <div className="mt-auto h-8 rounded bg-helix-elevated" />
          </div>
        </div>
      )}
      {kind === 'graph' && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 112">
          <circle cx="50" cy="56" r="8" fill="#3EE0C5" opacity="0.7" />
          <circle cx="100" cy="30" r="6" fill="#E8A87C" opacity="0.8" />
          <circle cx="140" cy="70" r="10" fill="#3EE0C5" opacity="0.45" />
          <circle cx="80" cy="85" r="5" fill="#E8A87C" opacity="0.55" />
          <line x1="50" y1="56" x2="100" y2="30" stroke="#3EE0C5" strokeOpacity="0.35" />
          <line x1="100" y1="30" x2="140" y2="70" stroke="#E8A87C" strokeOpacity="0.3" />
          <line x1="50" y1="56" x2="80" y2="85" stroke="#3EE0C5" strokeOpacity="0.25" />
          <line x1="80" y1="85" x2="140" y2="70" stroke="#E8A87C" strokeOpacity="0.2" />
        </svg>
      )}
      {kind === 'dna' && (
        <div className="absolute inset-x-4 bottom-3 top-4 flex items-end gap-1.5">
          {[62, 78, 54, 88, 71, 65, 82, 58, 74, 69, 76, 60].map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-helix-signal/50 to-helix-copper/40"
              style={{ height: `${v}%` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
