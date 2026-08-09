import { Skeleton } from '@/components/ui/Skeleton'
import { MissionFrame } from '@/components/layout/PageTransition'
import { motion } from 'framer-motion'
import { revealItem } from '@/lib/motion'
import { cn } from '@/lib/utils'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <MissionFrame stagger={false} className={className}>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        role="status"
        aria-label="Loading"
        className="space-y-8"
      >
        {children}
      </motion.div>
    </MissionFrame>
  )
}

function HeaderBones() {
  return (
    <motion.div variants={revealItem} className="space-y-3">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-4 w-full max-w-md" />
    </motion.div>
  )
}

export function DashboardSkeleton() {
  return (
    <Frame>
      <HeaderBones />
      <motion.div variants={revealItem} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" delay={i * 0.04} />
        ))}
      </motion.div>
      <motion.div variants={revealItem} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" delay={i * 0.05} />
        ))}
      </motion.div>
      <motion.div variants={revealItem} className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </motion.div>
    </Frame>
  )
}

export function InterviewSkeleton() {
  return (
    <div className="flex h-[calc(100svh-4.25rem)] flex-col lg:flex-row" role="status" aria-label="Loading chamber">
      <div className="flex min-w-0 flex-1 flex-col border-b border-helix-border/60 p-4 lg:border-b-0 lg:border-r lg:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <Skeleton className="mb-4 h-2 w-full" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-[85%] rounded-2xl" />
          <Skeleton className="ml-auto h-16 w-[70%] rounded-2xl" />
          <Skeleton className="h-24 w-[80%] rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-20 w-full rounded-xl" />
      </div>
      <div className="flex w-full flex-col gap-4 overflow-hidden p-4 lg:w-[420px] lg:p-5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className={cn('w-full', i === 0 ? 'h-28' : 'h-40')} delay={i * 0.05} />
        ))}
      </div>
    </div>
  )
}

export function KnowledgeSkeleton() {
  return (
    <Frame>
      <HeaderBones />
      <motion.div variants={revealItem} className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-48" />
      </motion.div>
      <motion.div variants={revealItem}>
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </motion.div>
    </Frame>
  )
}

export function CurriculumSkeleton() {
  return (
    <Frame>
      <div className="flex items-end justify-between gap-4">
        <HeaderBones />
        <Skeleton className="hidden h-20 w-20 rounded-full sm:block" />
      </div>
      <motion.div variants={revealItem} className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-64" />
      </motion.div>
      <motion.div variants={revealItem} className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" delay={i * 0.04} />
        ))}
      </motion.div>
    </Frame>
  )
}

export function DebriefSkeleton() {
  return (
    <Frame>
      <HeaderBones />
      <motion.div variants={revealItem}>
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </motion.div>
      <motion.div variants={revealItem} className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </motion.div>
    </Frame>
  )
}

export function DnaSkeleton() {
  return (
    <Frame>
      <HeaderBones />
      <motion.div variants={revealItem} className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </motion.div>
      <motion.div variants={revealItem}>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </motion.div>
      <motion.div variants={revealItem} className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-36" delay={i * 0.03} />
        ))}
      </motion.div>
    </Frame>
  )
}

export function SettingsSkeleton() {
  return (
    <Frame className="max-w-3xl">
      <HeaderBones />
      <motion.div variants={revealItem} className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </motion.div>
      <motion.div variants={revealItem}>
        <Skeleton className="h-72 w-full" />
      </motion.div>
    </Frame>
  )
}

export function LandingSkeleton() {
  return (
    <div className="min-h-svh space-y-8 p-6 md:p-10" role="status" aria-label="Loading">
      <Skeleton className="h-12 w-40" />
      <Skeleton className="h-16 w-full max-w-xl" />
      <Skeleton className="h-6 w-full max-w-md" />
      <div className="flex gap-3">
        <Skeleton className="h-12 w-36" />
        <Skeleton className="h-12 w-36" />
      </div>
      <Skeleton className="mt-10 h-[360px] w-full rounded-2xl" />
    </div>
  )
}

export type PageSkeletonKind =
  | 'dashboard'
  | 'interview'
  | 'knowledge'
  | 'curriculum'
  | 'debrief'
  | 'dna'
  | 'settings'
  | 'landing'

const skeletonMap: Record<PageSkeletonKind, () => React.ReactElement> = {
  dashboard: DashboardSkeleton,
  interview: InterviewSkeleton,
  knowledge: KnowledgeSkeleton,
  curriculum: CurriculumSkeleton,
  debrief: DebriefSkeleton,
  dna: DnaSkeleton,
  settings: SettingsSkeleton,
  landing: LandingSkeleton,
}

export function PageSkeleton({ kind }: { kind: PageSkeletonKind }) {
  const Comp = skeletonMap[kind]
  return <Comp />
}
