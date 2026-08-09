import { cn } from '@/lib/utils'
import { Check, Circle } from 'lucide-react'
import type { ReasoningStep } from '@/types'
import { motion } from 'framer-motion'
import { ThinkingPulse } from './ThinkingPulse'

/** Static / historical reasoning steps — active state uses pulse, not a spinner */
export function ReasoningPanel({
  steps,
  className,
}: {
  steps: ReasoningStep[]
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Reasoning</h3>
        <span className="text-[10px] uppercase tracking-wider text-helix-muted">Live</span>
      </div>
      <ul className="space-y-2">
        {steps.map((step, i) => (
          <motion.li
            key={`${step.id}-${step.status}-${step.label}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'rounded-xl border px-3 py-2.5',
              step.status === 'active' && 'border-helix-signal/40 bg-helix-signal/5',
              step.status === 'done' && 'border-helix-border/60 bg-helix-elevated/40',
              step.status === 'pending' && 'border-helix-border/40 opacity-60',
            )}
          >
            <div className="flex items-start gap-2">
              {step.status === 'done' && (
                <Check className="mt-0.5 h-3.5 w-3.5 text-helix-success" />
              )}
              {step.status === 'active' && (
                <span className="mt-1">
                  <ThinkingPulse />
                </span>
              )}
              {step.status === 'pending' && (
                <Circle className="mt-0.5 h-3.5 w-3.5 text-helix-muted" />
              )}
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="mt-0.5 text-xs text-helix-muted">{step.detail}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
