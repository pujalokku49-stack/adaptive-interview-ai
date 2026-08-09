import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
  baseId: string
  register: (value: string, el: HTMLButtonElement | null) => void
  values: () => string[]
}

const TabsContext = createContext<TabsContextValue | null>(null)

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
  children: ReactNode
  className?: string
}) {
  const [internal, setInternal] = useState(defaultValue)
  const value = controlled ?? internal
  const baseId = useId()
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const order = useRef<string[]>([])

  const setValue = (v: string) => {
    setInternal(v)
    onValueChange?.(v)
  }

  const register = useCallback((tabValue: string, el: HTMLButtonElement | null) => {
    if (el) {
      refs.current.set(tabValue, el)
      if (!order.current.includes(tabValue)) order.current.push(tabValue)
    } else {
      refs.current.delete(tabValue)
    }
  }, [])

  return (
    <TabsContext.Provider
      value={{
        value,
        setValue,
        baseId,
        register,
        values: () => order.current.filter((v) => refs.current.has(v)),
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ctx = useContext(TabsContext)!

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ctx.values()
    const idx = keys.indexOf(ctx.value)
    if (idx < 0) return

    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      next = (idx + 1) % keys.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      next = (idx - 1 + keys.length) % keys.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      next = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      next = keys.length - 1
    }
    if (next >= 0) {
      ctx.setValue(keys[next])
      refsFocus(ctx, keys[next])
    }
  }

  return (
    <div
      className={cn(
        'inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-helix-border bg-helix-elevated/50 p-1',
        className,
      )}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}

function refsFocus(ctx: TabsContextValue, value: string) {
  // Focus via DOM query by id — register map may be stale mid-render
  document.getElementById(`${ctx.baseId}-tab-${value}`)?.focus()
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const ctx = useContext(TabsContext)!
  const active = ctx.value === value
  const tabId = `${ctx.baseId}-tab-${value}`
  const panelId = `${ctx.baseId}-panel-${value}`

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      ref={(el) => ctx.register(value, el)}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'relative rounded-lg px-3 py-1.5 font-display text-sm font-medium transition-colors',
        'focus-ring',
        active ? 'text-[var(--color-helix-on-accent)]' : 'text-helix-muted hover:text-helix-text',
        className,
      )}
    >
      {active && (
        <motion.span
          layoutId={`${ctx.baseId}-pill`}
          className="absolute inset-0 rounded-lg bg-helix-signal"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const ctx = useContext(TabsContext)!
  if (ctx.value !== value) return null
  return (
    <motion.div
      id={`${ctx.baseId}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4 outline-none focus-visible:ring-2 focus-visible:ring-helix-signal/30 rounded-xl', className)}
    >
      {children}
    </motion.div>
  )
}
