import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  meta?: string
  active?: boolean
  done?: boolean
}

export function Timeline({
  items,
  className,
  growKey,
}: {
  items: TimelineItem[]
  className?: string
  /** Bump when a new beat is appended — drives enter animation */
  growKey?: number | string
}) {
  return (
    <ol className={cn('relative space-y-0', className)}>
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, x: -16, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 12 }}
            transition={{
              delay: typeof growKey === 'number' && i === items.length - 1 ? 0.05 : i * 0.03,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {i < items.length - 1 && (
              <motion.span
                layout
                className="absolute left-[9px] top-5 w-px origin-top bg-helix-border"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ height: 'calc(100% - 8px)' }}
              />
            )}
            <motion.span
              layout
              animate={
                item.active
                  ? {
                      scale: [1, 1.15, 1],
                      boxShadow: [
                        '0 0 0 0 transparent',
                        '0 0 16px -2px rgb(62 224 197 / 0.55)',
                        '0 0 0 0 transparent',
                      ],
                    }
                  : { scale: 1 }
              }
              transition={item.active ? { duration: 1.4, repeat: Infinity } : undefined}
              className={cn(
                'relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2',
                item.done && 'border-helix-success bg-helix-success',
                item.active && 'border-helix-signal bg-helix-signal',
                !item.done && !item.active && 'border-helix-border bg-helix-surface',
              )}
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p
                  className={cn(
                    'font-display text-sm font-semibold',
                    item.active && 'text-helix-signal',
                  )}
                >
                  {item.title}
                </p>
                {item.meta && <span className="text-xs text-helix-muted">{item.meta}</span>}
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-helix-muted">{item.description}</p>
              )}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  )
}
