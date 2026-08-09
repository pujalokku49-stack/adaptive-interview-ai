import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/motion'

interface Item {
  id: string
  title: string
  content: ReactNode
}

export function Accordion({
  items,
  allowMultiple = false,
  className,
}: {
  items: Item[]
  allowMultiple?: boolean
  className?: string
}) {
  const [open, setOpen] = useState<string[]>([])
  const reduce = useReducedMotion()

  const toggle = (id: string) => {
    setOpen((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return allowMultiple ? [...prev, id] : [id]
    })
  }

  return (
    <div
      className={cn(
        'divide-y divide-helix-border/60 overflow-hidden rounded-2xl border border-helix-border/60 panel-adaptive',
        className,
      )}
    >
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        return (
          <div
            key={item.id}
            className="relative z-[1] bg-transparent first:rounded-t-2xl last:rounded-b-2xl"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="focus-ring flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-helix-elevated/25"
              aria-expanded={isOpen}
              id={`accordion-${item.id}`}
              aria-controls={`accordion-panel-${item.id}`}
            >
              <span className="font-display text-sm font-semibold">{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : springs.snappy}
                className="inline-flex"
              >
                <ChevronDown className="h-4 w-4 shrink-0 text-helix-muted" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  id={`accordion-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-${item.id}`}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { height: springs.soft, opacity: { duration: 0.2 } }
                  }
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-sm leading-relaxed text-helix-muted">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
