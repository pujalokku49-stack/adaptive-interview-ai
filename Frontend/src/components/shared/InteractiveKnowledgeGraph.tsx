import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type MasteryLevel = 'mastered' | 'partial' | 'weak' | 'current'

export interface CurriculumGraphNode {
  id: string
  label: string
  mastery: number
  level: MasteryLevel
  detail: string
  related: string[]
  x: number
  y: number
}

export interface CurriculumGraphEdge {
  source: string
  target: string
}

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  mastered: '#6DCB8E',
  partial: '#E8A87C',
  weak: '#E87A7A',
  current: '#5BA4E8',
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  mastered: 'Mastered',
  partial: 'Partial',
  weak: 'Weak',
  current: 'Current Topic',
}

function levelFromMastery(mastery: number, currentId: string | null, id: string): MasteryLevel {
  if (currentId && id === currentId) return 'current'
  if (mastery >= 0.8) return 'mastered'
  if (mastery >= 0.45) return 'partial'
  return 'weak'
}

/** Canonical curriculum topic constellation */
export const CURRICULUM_TOPICS: Omit<CurriculumGraphNode, 'level'>[] = [
  {
    id: 'rag',
    label: 'RAG',
    mastery: 0.86,
    detail: 'Retrieval pipelines, hybrid search, citation grounding.',
    related: ['vectors', 'prompt', 'prod'],
    x: 210,
    y: 120,
  },
  {
    id: 'prompt',
    label: 'Prompt Engineering',
    mastery: 0.62,
    detail: 'Instruction design, tool schemas, eval-driven prompting.',
    related: ['rag', 'agents', 'mcp'],
    x: 380,
    y: 90,
  },
  {
    id: 'vectors',
    label: 'Vector Databases',
    mastery: 0.74,
    detail: 'Indexing, ANN recall, metadata filters, freshness.',
    related: ['rag', 'deploy'],
    x: 90,
    y: 210,
  },
  {
    id: 'agents',
    label: 'Agentic AI',
    mastery: 0.48,
    detail: 'Planning, tool routing, multi-step orchestration.',
    related: ['prompt', 'mcp', 'prod'],
    x: 460,
    y: 200,
  },
  {
    id: 'mcp',
    label: 'MCP',
    mastery: 0.28,
    detail: 'Model Context Protocol tools, contracts, sandboxing.',
    related: ['agents', 'prompt', 'deploy'],
    x: 340,
    y: 280,
  },
  {
    id: 'deploy',
    label: 'Deployment',
    mastery: 0.55,
    detail: 'Serving, rollouts, canaries, infra for inference.',
    related: ['vectors', 'mcp', 'prod'],
    x: 160,
    y: 330,
  },
  {
    id: 'prod',
    label: 'Production Systems',
    mastery: 0.34,
    detail: 'SLOs, silent failure modes, observability, runbooks.',
    related: ['rag', 'agents', 'deploy'],
    x: 300,
    y: 380,
  },
]

export const CURRICULUM_EDGES: CurriculumGraphEdge[] = [
  { source: 'rag', target: 'vectors' },
  { source: 'rag', target: 'prompt' },
  { source: 'rag', target: 'prod' },
  { source: 'prompt', target: 'agents' },
  { source: 'prompt', target: 'mcp' },
  { source: 'agents', target: 'mcp' },
  { source: 'agents', target: 'prod' },
  { source: 'vectors', target: 'deploy' },
  { source: 'mcp', target: 'deploy' },
  { source: 'deploy', target: 'prod' },
]

/** Per-turn mastery deltas + current topic focus during interview */
const TURN_GRAPH_UPDATES: Array<{
  currentId: string
  deltas: Record<string, number>
}> = [
  {
    currentId: 'rag',
    deltas: { rag: 0.04, vectors: 0.03, prod: -0.02, prompt: 0.02 },
  },
  {
    currentId: 'prod',
    deltas: { prod: 0.08, rag: 0.02, deploy: 0.05, agents: -0.03, mcp: -0.02 },
  },
  {
    currentId: 'agents',
    deltas: { agents: 0.1, mcp: 0.06, prompt: 0.04, prod: 0.03 },
  },
  {
    currentId: 'mcp',
    deltas: { mcp: 0.12, agents: 0.04, deploy: 0.03 },
  },
]

function buildNodes(
  masteryMap: Record<string, number>,
  currentId: string | null,
): CurriculumGraphNode[] {
  return CURRICULUM_TOPICS.map((t) => {
    const mastery = Math.max(0.05, Math.min(0.98, masteryMap[t.id] ?? t.mastery))
    return {
      ...t,
      mastery,
      level: levelFromMastery(mastery, currentId, t.id),
    }
  })
}

export function useLiveKnowledgeGraph(turnCount: number, live = true) {
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(CURRICULUM_TOPICS.map((t) => [t.id, t.mastery])),
  )
  const [currentId, setCurrentId] = useState<string | null>(live ? 'rag' : null)
  const [pulseIds, setPulseIds] = useState<string[]>([])
  const appliedTurn = useRef(live ? 2 : 0)

  useEffect(() => {
    if (!live) return
    // Baseline interview already mid-session on RAG / retrieval
    setCurrentId('rag')
  }, [live])

  useEffect(() => {
    if (!live) return
    if (turnCount <= appliedTurn.current) return

    const steps = turnCount - appliedTurn.current
    let nextMap = { ...masteryMap }
    let nextCurrent = currentId
    const changed: string[] = []

    for (let s = 0; s < steps; s++) {
      const idx = Math.min(appliedTurn.current - 2 + s, TURN_GRAPH_UPDATES.length - 1)
      const update = TURN_GRAPH_UPDATES[Math.max(0, idx)]
      if (!update) continue
      nextCurrent = update.currentId
      for (const [id, delta] of Object.entries(update.deltas)) {
        nextMap[id] = Math.max(0.05, Math.min(0.98, (nextMap[id] ?? 0.3) + delta))
        changed.push(id)
      }
    }

    appliedTurn.current = turnCount
    setMasteryMap(nextMap)
    setCurrentId(nextCurrent)
    setPulseIds([...new Set(changed)])
    const t = window.setTimeout(() => setPulseIds([]), 2400)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnCount, live])

  const nodes = useMemo(
    () => buildNodes(masteryMap, currentId),
    [masteryMap, currentId],
  )

  const bumpTopic = useCallback((id: string, delta: number) => {
    setMasteryMap((prev) => ({
      ...prev,
      [id]: Math.max(0.05, Math.min(0.98, (prev[id] ?? 0.3) + delta)),
    }))
    setPulseIds([id])
    window.setTimeout(() => setPulseIds([]), 1800)
  }, [])

  return {
    nodes,
    edges: CURRICULUM_EDGES,
    currentId,
    pulseIds,
    setCurrentId,
    bumpTopic,
  }
}

interface InteractiveKnowledgeGraphProps {
  nodes: CurriculumGraphNode[]
  edges: CurriculumGraphEdge[]
  pulseIds?: string[]
  className?: string
  compact?: boolean
  title?: string
  liveLabel?: string
}

export function InteractiveKnowledgeGraph({
  nodes,
  edges,
  pulseIds = [],
  className,
  compact = false,
  title = 'Curriculum Knowledge Graph',
  liveLabel,
}: InteractiveKnowledgeGraphProps) {
  const uid = useId()
  const width = compact ? 360 : 640
  const height = compact ? 300 : 460
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const wrapRef = useRef<HTMLDivElement>(null)

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  )
  const hoveredNode = hovered ? nodeMap[hovered] : null

  const onNodeEnter = (id: string, x: number, y: number) => {
    setHovered(id)
    setTooltipPos({ x, y })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          {liveLabel && (
            <p className="text-[10px] uppercase tracking-[0.14em] text-helix-muted">
              {liveLabel}
            </p>
          )}
        </div>
        <MasteryLegend compact={compact} />
      </div>

      <div
        ref={wrapRef}
        className="relative overflow-hidden panel-adaptive"
        onMouseLeave={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={cn(
            'relative z-[1] w-full',
            compact ? 'min-h-[260px]' : 'min-h-[380px]',
          )}
        >
          <defs>
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {Object.entries(MASTERY_COLORS).map(([level, color]) => (
              <radialGradient key={level} id={`${uid}-${level}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            ))}
            <marker
              id={`${uid}-arrow`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="rgba(62,224,197,0.35)" />
            </marker>
          </defs>

          {/* Animated edges */}
          {edges.map((e, i) => {
            const s = nodeMap[e.source]
            const t = nodeMap[e.target]
            if (!s || !t) return null
            const active =
              pulseIds.includes(e.source) ||
              pulseIds.includes(e.target) ||
              hovered === e.source ||
              hovered === e.target
            const midX = (s.x + t.x) / 2 + (i % 2 === 0 ? 12 : -12)
            const midY = (s.y + t.y) / 2 + (i % 2 === 0 ? -10 : 10)
            const path = `M ${s.x} ${s.y} Q ${midX} ${midY} ${t.x} ${t.y}`

            return (
              <g key={`${e.source}-${e.target}`}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke={active ? 'rgba(62,224,197,0.55)' : 'rgba(62,224,197,0.2)'}
                  strokeWidth={active ? 2 : 1.25}
                  strokeDasharray="5 8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 1,
                    strokeDashoffset: [0, -52],
                  }}
                  transition={{
                    pathLength: { delay: 0.04 * i, duration: 0.7 },
                    opacity: { delay: 0.04 * i, duration: 0.4 },
                    strokeDashoffset: {
                      duration: active ? 1.4 : 2.8,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                  }}
                />
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((n, i) => {
            const color = MASTERY_COLORS[n.level]
            const r = compact ? 14 + n.mastery * 10 : 16 + n.mastery * 14
            const pulsing = pulseIds.includes(n.id)
            const isHover = hovered === n.id

            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onMouseEnter={() => onNodeEnter(n.id, n.x, n.y)}
                onFocus={() => onNodeEnter(n.id, n.x, n.y)}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}: ${MASTERY_LABELS[n.level]}, ${Math.round(n.mastery * 100)}% mastery`}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + (isHover || pulsing ? 16 : 12)}
                  fill={`url(#${uid}-${n.level})`}
                  opacity={0.55}
                />
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  fill={color}
                  fillOpacity={0.22}
                  stroke={color}
                  strokeWidth={n.level === 'current' ? 3 : 2}
                  filter={n.level === 'current' || pulsing ? `url(#${uid}-glow)` : undefined}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{
                    r: pulsing ? [r, r + 3, r] : r,
                    opacity: 1,
                    scale: isHover ? 1.08 : 1,
                  }}
                  transition={{
                    r: pulsing
                      ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                      : { delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 18 },
                    scale: { type: 'spring', stiffness: 400, damping: 24 },
                  }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
                {n.level === 'current' && (
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="4 6"
                    initial={{ r: r + 6, opacity: 0.5 }}
                    animate={{
                      r: [r + 6, r + 12, r + 6],
                      opacity: [0.35, 0.85, 0.35],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <text
                  x={n.x}
                  y={n.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  className="fill-helix-text pointer-events-none"
                  fontSize={compact ? 9 : 10}
                  fontFamily="Outfit, sans-serif"
                  fontWeight={600}
                >
                  {compact && n.label.length > 12 ? n.label.slice(0, 10) + '…' : n.label}
                </text>
                {!compact && (
                  <text
                    x={n.x}
                    y={n.y + r + 14}
                    textAnchor="middle"
                    className="fill-helix-muted pointer-events-none"
                    fontSize={10}
                    fontFamily="Outfit, sans-serif"
                  >
                    {Math.round(n.mastery * 100)}%
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover mastery details */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              className="pointer-events-none absolute z-20 w-56 rounded-xl border border-helix-border/70 bg-helix-surface/95 p-3 shadow-float backdrop-blur-xl"
              style={{
                left: `min(calc(${(tooltipPos.x / width) * 100}% + 12px), calc(100% - 15rem))`,
                top: `max(8px, calc(${(tooltipPos.y / height) * 100}% - 4.5rem))`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold">{hoveredNode.label}</p>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: MASTERY_COLORS[hoveredNode.level],
                    background: `${MASTERY_COLORS[hoveredNode.level]}22`,
                  }}
                >
                  {MASTERY_LABELS[hoveredNode.level]}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-helix-muted">
                {hoveredNode.detail}
              </p>
              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-helix-muted">
                  <span>Mastery</span>
                  <span style={{ color: MASTERY_COLORS[hoveredNode.level] }}>
                    {Math.round(hoveredNode.mastery * 100)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-helix-elevated">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: MASTERY_COLORS[hoveredNode.level] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${hoveredNode.mastery * 100}%` }}
                  />
                </div>
              </div>
              {hoveredNode.related.length > 0 && (
                <p className="mt-2 text-[10px] text-helix-muted">
                  Linked:{' '}
                  {hoveredNode.related
                    .map((id) => nodeMap[id]?.label)
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MasteryLegend({ compact }: { compact?: boolean }) {
  const items: MasteryLevel[] = ['mastered', 'partial', 'weak', 'current']
  return (
    <div className={cn('flex flex-wrap gap-2', compact && 'gap-1.5')}>
      {items.map((level) => (
        <span
          key={level}
          className="inline-flex items-center gap-1.5 rounded-lg border border-helix-border/50 bg-helix-elevated/30 px-2 py-1 text-[10px] text-helix-muted"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: MASTERY_COLORS[level], boxShadow: `0 0 8px ${MASTERY_COLORS[level]}88` }}
          />
          {compact ? MASTERY_LABELS[level].split(' ')[0] : MASTERY_LABELS[level]}
        </span>
      ))}
    </div>
  )
}

/** Backward-compatible wrapper used by Knowledge page */
export function KnowledgeGraphViz({
  className,
  liveTurnCount,
}: {
  nodes?: unknown
  edges?: unknown
  className?: string
  liveTurnCount?: number
}) {
  const { nodes, edges, pulseIds } = useLiveKnowledgeGraph(liveTurnCount ?? 2, true)
  return (
    <InteractiveKnowledgeGraph
      nodes={nodes}
      edges={edges}
      pulseIds={pulseIds}
      className={className}
      liveLabel="Live mastery · hover nodes for detail"
    />
  )
}
