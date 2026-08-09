import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CandidateAvatar } from '@/components/shared/Avatars'
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter'
import { LiveDnaStrip } from '@/components/shared/CandidateDnaViz'
import { AIThinkingPanel } from '@/components/shared/AIThinkingPanel'
import { AIMemoryPanel } from '@/components/shared/AIMemoryPanel'
import { ReasoningPanel } from '@/components/shared/ReasoningPanel'
import { InteractiveKnowledgeGraph } from '@/components/shared/InteractiveKnowledgeGraph'
import { Timeline, type TimelineItem } from '@/components/shared/Timeline'
import { ProgressCircle } from '@/components/ui/ProgressCircle'
import { currentUser } from '@/data/mock'
import type { DnaSkillNode, ReasoningStep, SkillDomain } from '@/types'
import type { InterviewMemory } from '@/components/shared/AIMemoryPanel'
import type { useAIThinking } from '@/components/shared/AIThinkingPanel'
import type { CurriculumGraphNode } from '@/components/shared/InteractiveKnowledgeGraph'

type RailTab = 'cognition' | 'memory' | 'graph' | 'timeline'

const TABS: { id: RailTab; label: string }[] = [
  { id: 'cognition', label: 'Cognition' },
  { id: 'memory', label: 'Memory' },
  { id: 'graph', label: 'Graph' },
  { id: 'timeline', label: 'Timeline' },
]

export function ChamberRail({
  confidence,
  confidencePulse,
  readiness,
  skillNodes,
  dnaPulseIds,
  lastFocus,
  dnaTurnCount,
  thinking,
  thinkingState,
  reasoning,
  memory,
  updating,
  flashKey,
  graphNodes,
  graphEdges,
  pulseIds,
  currentId,
  timelineItems,
  timelineGrowKey,
  progressPulse,
}: {
  confidence: number
  confidencePulse: boolean
  readiness: number
  skillNodes: DnaSkillNode[]
  dnaPulseIds: SkillDomain[]
  lastFocus: string | null
  dnaTurnCount: number
  thinking: boolean
  thinkingState: ReturnType<typeof useAIThinking>
  reasoning: ReasoningStep[]
  memory: InterviewMemory
  updating: boolean
  flashKey: number
  graphNodes: CurriculumGraphNode[]
  graphEdges: { source: string; target: string }[]
  pulseIds: string[]
  currentId: string | null
  timelineItems: TimelineItem[]
  timelineGrowKey: number
  progressPulse: boolean
}) {
  const [tab, setTab] = useState<RailTab>('cognition')

  return (
    <aside className="os-rail flex w-full flex-col border-l-0 lg:w-[400px] lg:border-l">
      {/* Sticky candidate strip */}
      <div
        className={cn(
          'shrink-0 border-b border-helix-border/60 px-4 py-4 md:px-5',
          confidencePulse && 'bg-helix-signal/5',
        )}
      >
        <div className="flex items-center gap-3">
          <CandidateAvatar name={currentUser.name} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-helix-muted">{currentUser.role}</p>
          </div>
          <ProgressCircle
            value={readiness}
            size={44}
            strokeWidth={4}
            color="var(--color-helix-signal)"
          />
        </div>
        <div className="mt-3">
          <ConfidenceMeter value={confidence} pulse={confidencePulse} />
        </div>
      </div>

      {/* DNA strip — no outer card */}
      <div
        className={cn(
          'shrink-0 border-b border-helix-border/50 px-4 py-3 md:px-5',
          dnaPulseIds.length > 0 && 'bg-helix-copper/5',
        )}
      >
        <LiveDnaStrip
          skills={skillNodes}
          pulsedIds={dnaPulseIds}
          readiness={readiness}
          lastFocus={lastFocus}
          turnCount={dnaTurnCount}
        />
        <Link
          to="/dna"
          className="mt-2 block text-center text-xs font-semibold text-helix-signal hover:underline"
        >
          Full Candidate DNA →
        </Link>
      </div>

      {/* Instrumentation tabs */}
      <div
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-helix-border/50 px-3 py-2"
        role="tablist"
        aria-label="Chamber instrumentation"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'focus-ring shrink-0 rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-colors',
              tab === t.id
                ? 'bg-helix-signal/15 text-helix-signal'
                : 'text-helix-muted hover:text-helix-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
        {tab === 'cognition' && (
          <RailSection active={thinking || reasoning.some((r) => r.status === 'active')}>
            <AIThinkingPanel thinkingState={thinkingState} />
            <div className="mt-6 border-t border-helix-border/40 pt-5">
              <ReasoningPanel steps={reasoning} />
            </div>
          </RailSection>
        )}
        {tab === 'memory' && (
          <RailSection active={updating} tone="copper">
            <AIMemoryPanel memory={memory} updating={updating} flashKey={flashKey} />
          </RailSection>
        )}
        {tab === 'graph' && (
          <RailSection active={pulseIds.length > 0}>
            <InteractiveKnowledgeGraph
              nodes={graphNodes}
              edges={graphEdges}
              pulseIds={pulseIds}
              compact
              title="Live Knowledge Graph"
              liveLabel={
                currentId
                  ? `Current · ${graphNodes.find((n) => n.id === currentId)?.label ?? 'topic'}`
                  : 'Synced with interview memory'
              }
            />
          </RailSection>
        )}
        {tab === 'timeline' && (
          <RailSection active={progressPulse}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">Question timeline</h3>
              <span className="text-[10px] uppercase tracking-wide text-helix-muted">
                Growing
              </span>
            </div>
            <Timeline items={timelineItems} growKey={timelineGrowKey} />
          </RailSection>
        )}
      </div>

      <div className="shrink-0 border-t border-helix-border/60 p-4 md:px-5">
        <Link to="/debrief">
          <Button variant="secondary" className="w-full" disabled={thinking}>
            End & open Knowledge Passport
          </Button>
        </Link>
      </div>
    </aside>
  )
}

function RailSection({
  children,
  active,
  tone = 'signal',
}: {
  children: ReactNode
  active?: boolean
  tone?: 'signal' | 'copper'
}) {
  return (
    <div
      className={cn(
        'rounded-xl transition-colors',
        active && tone === 'signal' && 'ring-1 ring-helix-signal/20',
        active && tone === 'copper' && 'ring-1 ring-helix-copper/25',
      )}
    >
      {children}
    </div>
  )
}
