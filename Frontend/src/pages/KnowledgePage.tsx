import {
  PageTransition,
  MissionFrame,
  IdentityBar,
} from '@/components/layout/PageTransition'
import {
  InteractiveKnowledgeGraph,
  useLiveKnowledgeGraph,
  MASTERY_COLORS,
  MASTERY_LABELS,
  type MasteryLevel,
} from '@/components/shared/InteractiveKnowledgeGraph'
import { Search } from '@/components/ui/Search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { EmptyState, PageStateGate } from '@/components/states'
import { usePageState } from '@/hooks/usePageState'

/** Interactive curriculum constellation */
export function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { nodes, edges, pulseIds, setCurrentId } = useLiveKnowledgeGraph(2, true)
  const { state, retry } = usePageState({ loadMs: 600 })

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return nodes
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.detail.toLowerCase().includes(q) ||
        MASTERY_LABELS[n.level].toLowerCase().includes(q),
    )
  }, [query, nodes])

  const selected = nodes.find((n) => n.id === (selectedId ?? pulseIds[0] ?? nodes[0]?.id))

  const focusTopic = (id: string) => {
    setSelectedId(id)
    setCurrentId(id)
  }

  const levels: Array<MasteryLevel | 'all'> = [
    'all',
    'mastered',
    'partial',
    'weak',
    'current',
  ]

  return (
    <PageStateGate
      state={state}
      kind="knowledge"
      onRetry={retry}
      onEmptyAction={() => setQuery('')}
    >
      <PageTransition>
        <MissionFrame>
          <IdentityBar
            label="Knowledge Graph"
            title="Curriculum constellation"
            meta="Nodes pulse with interview signal · edges show concept adjacency"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              id="knowledge-search"
              placeholder="Filter topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:max-w-xs"
              aria-label="Filter knowledge topics"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.85fr] lg:items-start">
            <InteractiveKnowledgeGraph
              nodes={nodes}
              edges={edges}
              pulseIds={pulseIds}
              liveLabel="Animated edges · mastery colors · hover for detail"
            />

            {selected && (
              <aside
                className="rounded-2xl border border-helix-border/50 bg-helix-surface/30 p-5"
                aria-live="polite"
              >
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-helix-copper">
                  Inspector
                </p>
                <h2 className="mt-2 font-display text-lg font-semibold">{selected.label}</h2>
                <p
                  className="mt-1 text-xs font-semibold"
                  style={{ color: MASTERY_COLORS[selected.level] }}
                >
                  {MASTERY_LABELS[selected.level]} · {Math.round(selected.mastery * 100)}%
                </p>
                <p className="mt-3 text-sm leading-relaxed text-helix-muted">
                  {selected.detail}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-helix-elevated">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selected.mastery * 100}%`,
                      background: MASTERY_COLORS[selected.level],
                    }}
                  />
                </div>
              </aside>
            )}
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              {levels.map((level) => (
                <TabsTrigger key={level} value={level}>
                  {level === 'all' ? 'All' : MASTERY_LABELS[level]}
                </TabsTrigger>
              ))}
            </TabsList>
            {levels.map((level) => {
              const list = filtered.filter((n) => level === 'all' || n.level === level)
              return (
                <TabsContent key={level} value={level}>
                  {list.length === 0 ? (
                    <EmptyState
                      compact
                      title="No matching nodes"
                      description="Adjust your search or switch mastery tabs to reveal topics."
                      actionLabel="Clear search"
                      onAction={() => setQuery('')}
                    />
                  ) : (
                    <NodeList
                      nodes={list}
                      selectedId={selected?.id}
                      onFocusTopic={focusTopic}
                    />
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </MissionFrame>
      </PageTransition>
    </PageStateGate>
  )
}

function NodeList({
  nodes,
  selectedId,
  onFocusTopic,
}: {
  nodes: ReturnType<typeof useLiveKnowledgeGraph>['nodes']
  selectedId?: string
  onFocusTopic: (id: string) => void
}) {
  return (
    <ul className="divide-y divide-helix-border/40 overflow-hidden rounded-2xl border border-helix-border/50">
      {nodes.map((n) => {
        const active = n.id === selectedId
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onFocusTopic(n.id)}
              className={cn(
                'focus-ring flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors',
                active
                  ? 'bg-helix-signal/8'
                  : 'bg-helix-surface/20 hover:bg-helix-elevated/40',
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: MASTERY_COLORS[n.level] }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-display text-sm font-semibold">
                    {n.label}
                  </span>
                  <span
                    className="shrink-0 font-display text-sm font-bold tabular-nums"
                    style={{ color: MASTERY_COLORS[n.level] }}
                  >
                    {Math.round(n.mastery * 100)}%
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-helix-muted">
                  {MASTERY_LABELS[n.level]} · {n.detail}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-helix-elevated">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${n.mastery * 100}%`,
                      background: MASTERY_COLORS[n.level],
                    }}
                  />
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
